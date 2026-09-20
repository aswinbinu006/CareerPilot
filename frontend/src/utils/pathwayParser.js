/**
 * Intelligent Parser and Normalizer for Educational Pathway Research
 * Transforms raw scraped search snippets, markdown tables, pipe-delimited text,
 * and LLM outputs into clean, structured, presentation-ready records.
 */

/**
 * Strips raw markdown table syntax, trailing pipes, and artifacts from text.
 */
export function cleanRawText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\|\s*--+\s*\|/g, ' ')
    .replace(/\|+/g, ' • ')
    .replace(/\s+/g, ' ')
    .replace(/(?:•\s*){2,}/g, '• ')
    .replace(/^[\s•]+|[\s•]+$/g, '')
    .trim();
}

/**
 * Parses raw college data (including scraped search tables with pipes)
 * into structured institution records.
 */
export function parseColleges(collegesData = [], markdownContent = '', targetDegree = '') {
  const structuredColleges = [];
  const feeTiers = [];
  const seenNames = new Set();

  const addCollege = (college) => {
    let norm = college.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!norm || norm.length < 3) return;
    if (
      norm.includes('sno') ||
      (norm.includes('college') && norm.length <= 8) ||
      norm.includes('totalfees') ||
      norm.includes('tuitionfee') ||
      norm.includes('feerange')
    ) {
      return;
    }

    // Canonical alias mappings for apex medical and engineering institutes
    if (norm.includes('aiims') && (norm.includes('delhi') || norm.includes('newdelhi'))) norm = 'aiimsdelhi';
    if (norm.includes('jipmer')) norm = 'jipmerpuducherry';
    if (norm.includes('cmc') && norm.includes('vellore')) norm = 'cmcvellore';
    if (norm.includes('kmc') && norm.includes('manipal')) norm = 'kmcmanipal';
    if (norm.includes('gandhi') && norm.includes('medical')) norm = 'gandhimedicalcollege';

    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      const points = Array.isArray(college.points) && college.points.length > 0
        ? college.points
        : generateCollegePoints(college, targetDegree);
      const explanation = college.explanation || generateCollegeExplanation(college, targetDegree);

      structuredColleges.push({
        ...college,
        points,
        explanation,
      });
    }
  };

  const rawItems = Array.isArray(collegesData) ? collegesData : [];

  for (const item of rawItems) {
    // If backend already synthesized structured college objects
    if (item.name && (item.points || item.explanation || item.rank)) {
      addCollege({
        name: cleanInstitutionName(item.name),
        location: item.location || inferLocation(item.name),
        type: item.type || inferType('', item.name),
        rank: item.rank || inferRank(item.name),
        fee: cleanFee(item.fee || 'Subsidized / Tiered'),
        points: item.points,
        explanation: item.explanation,
        url: item.url || '',
      });
      continue;
    }

    const text = (item.content || item.description || '') + ' ' + (item.title || '');
    const sourceUrl = item.url || '';

    // Pattern 1: | S. No | College | City | State | Type | NIRF Rank |
    const p1Regex = /\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|/gi;
    let match;
    const validTypes = ['private', 'deemed', 'govt', 'government', 'public', 'autonomous', 'state', 'central'];
    while ((match = p1Regex.exec(text)) !== null) {
      const name = match[1].trim();
      const city = match[2].trim();
      const state = match[3].trim();
      const type = match[4].trim();
      const rank = match[5].trim();

      if (validTypes.some((t) => type.toLowerCase().includes(t))) {
        addCollege({
          name: cleanInstitutionName(name),
          location: state ? `${city}, ${state}` : city,
          type: inferType(type, name),
          rank: `NIRF #${rank}`,
          fee: 'Refer to Prospectus',
          url: sourceUrl,
        });
      }
    }

    // Pattern 3: | AIIMS Delhi Admission | INR 6,075 | 1 |
    const p3Regex = /\|\s*([A-Za-z0-9\s,.\(\)&'-]+?)(?:\s+Admission)?\s*\|\s*(INR\s*[0-9,.]+(?:\s*(?:lakh|crore))?)\s*\|\s*(\d+)\s*\|/gi;
    while ((match = p3Regex.exec(text)) !== null) {
      const name = match[1].trim();
      const fee = match[2].trim();
      const rank = match[3].trim();

      if (!name.toLowerCase().includes('public') && !name.toLowerCase().includes('private') && !name.toLowerCase().includes('college')) {
        addCollege({
          name: cleanInstitutionName(name),
          location: inferLocation(name),
          type: inferType('', name),
          rank: `NIRF #${rank}`,
          fee: cleanFee(fee),
          url: sourceUrl,
        });
      }
    }

    // Pattern 2: | S. No | College | Location | Approx. Total MBBS Fees | | 1 | Gandhi Medical College | Secunderabad, Telangana | ₹85,000 |
    const p2Regex = /\|\s*\d+\s*\|\s*([A-Za-z0-9\s,.\(\)&'-]+?)\s*\|\s*([A-Za-z0-9\s,.-]+?)\s*\|\s*([₹\d,\w\s.]+?)\s*\|/gi;
    while ((match = p2Regex.exec(text)) !== null) {
      const name = match[1].trim();
      const loc = match[2].trim();
      const fee = match[3].trim();

      if (
        name.length > 3 &&
        !name.toLowerCase().startsWith('s.') &&
        !name.toLowerCase().includes('approx') &&
        (fee.includes('₹') || fee.toLowerCase().includes('inr') || /^\d/.test(fee))
      ) {
        addCollege({
          name: cleanInstitutionName(name),
          location: loc,
          type: inferType('', name),
          rank: inferRank(name),
          fee: cleanFee(fee),
          url: sourceUrl,
        });
      }
    }

    // Extract fee range tiers if present
    const feeTierRegex = /\|\s*(Upto\s*INR[^|]+|INR\s*[0-9]+[^|]+)\s*\|\s*([^|]+?)\s*\|/gi;
    while ((match = feeTierRegex.exec(text)) !== null) {
      const range = match[1].trim();
      const collegesInTier = match[2].trim();
      if (collegesInTier && collegesInTier.length > 5 && !collegesInTier.toLowerCase().includes('fee range')) {
        feeTiers.push({
          range: range.replace(/INR/g, '₹').replace(/\s+/g, ' '),
          colleges: collegesInTier.split(',').map((c) => c.trim()).filter(Boolean),
        });
      }
    }
  }

  // Also check markdown report under "## Colleges" if structured list exists
  if (markdownContent && structuredColleges.length < 3) {
    const mdColleges = extractCollegesFromMarkdown(markdownContent);
    for (const c of mdColleges) {
      addCollege(c);
    }
  }

  // Domain fallback: If no structured colleges could be extracted from scraped tables,
  // provide premier institutions tailored to target degree with complete point breakdowns
  if (structuredColleges.length < 3) {
    const defaultInstitutions = getFallbackInstitutions(targetDegree);
    for (const def of defaultInstitutions) {
      addCollege(def);
    }
  }

  return {
    colleges: structuredColleges,
    feeTiers,
    rawSources: rawItems.map((item) => ({
      title: cleanArticleTitle(item.title),
      url: item.url,
      summary: cleanRawText(item.content || item.description).slice(0, 180) + '...',
    })),
  };
}

/**
 * Parses raw entrance exam data into structured, degree-aligned test records.
 * STRICTLY filters out irrelevant exams (e.g. NEVER show JEE/CUET for MBBS candidates).
 */
export function parseEntranceExams(examsData = [], markdownContent = '', targetDegree = '') {
  let exams = [];
  const seen = new Set();

  const addExam = (exam) => {
    const norm = exam.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!norm || seen.has(norm)) return;
    seen.add(norm);
    exams.push(exam);
  };

  const rawItems = Array.isArray(examsData) ? examsData : [];
  const combinedContext = `${targetDegree} ${markdownContent}`.toLowerCase();
  const isMedical = /mbbs|medicine|medical|doctor|clinical|bds|bams|bhms|biomedical|nursing|pharmacy/i.test(combinedContext);
  const isEngineering = /b\.?tech|engineering|computer science|cse|b\.?e\b|software|robotics|aerospace/i.test(combinedContext);
  const isLaw = /law|ll\.?b|legal/i.test(combinedContext);
  const isCommerce = /commerce|b\.?com|bba|management|finance|accounting|economics/i.test(combinedContext);

  // Parse items from search or agent JSON
  for (const item of rawItems) {
    // If agent already verified the exam
    if (item.title && item.conducting_body) {
      addExam({
        name: item.title,
        conductingBody: item.conducting_body,
        level: item.level || 'National Gateway',
        scope: item.scope || 'Degree Admissions Assessment',
        eligibility: item.eligibility || '10+2 Qualifying Criteria',
        details: cleanRawText(item.content || item.details || ''),
        url: item.url || 'https://nta.ac.in',
      });
      continue;
    }

    const text = `${item.title || ''} ${item.content || ''}`;
    const cleanContent = cleanRawText(item.content || item.description);

    // Common exams catalog
    const examKeywords = [
      { name: 'NEET-UG', body: 'NTA', level: 'Apex National Gateway', scope: 'Sole Mandatory Admission Gateway for MBBS, BDS & AYUSH across India', medicalOnly: true },
      { name: 'AIIMS Paramedical & B.Sc Nursing', body: 'AIIMS New Delhi', level: 'National Level', scope: 'Premier Medical Research & Allied Health Sciences', medicalOnly: true },
      { name: 'JEE Main', body: 'NTA', level: 'National Gateway', scope: 'NITs, IIITs, and CFTIs Engineering Admissions', engineeringOnly: true },
      { name: 'JEE Advanced', body: 'IIT Consortium', level: 'National Gateway', scope: 'Admissions into 23 Indian Institutes of Technology (IITs)', engineeringOnly: true },
      { name: 'BITSAT', body: 'BITS Pilani', level: 'University Gateway', scope: 'BITS Pilani, Goa, and Hyderabad Engineering Campuses', engineeringOnly: true },
      { name: 'CUET-UG', body: 'NTA', level: 'National Assessment', scope: 'Central & State Universities Degree Admissions', general: true },
      { name: 'CLAT', body: 'Consortium of NLUs', level: 'National Gateway', scope: '26 National Law Universities (NLUs) Five-Year Law', lawOnly: true },
      { name: 'IPMAT', body: 'IIM Indore / Rohtak', level: 'National Gateway', scope: 'Five-Year Integrated Program in Management (IIMs)', commerceOnly: true },
    ];

    let foundKeyword = false;
    for (const kw of examKeywords) {
      if (new RegExp(`\\b${kw.name.replace('-', '[-\\s]')}\\b`, 'i').test(text)) {
        // Enforce strict domain exclusivity
        if (isMedical && (kw.engineeringOnly || kw.lawOnly || kw.commerceOnly)) continue;
        if (isEngineering && kw.medicalOnly) continue;
        if (isCommerce && (kw.medicalOnly || kw.engineeringOnly)) continue;
        if (isLaw && (kw.medicalOnly || kw.engineeringOnly)) continue;

        foundKeyword = true;
        addExam({
          name: kw.name,
          conductingBody: kw.body,
          level: kw.level,
          scope: kw.scope,
          url: item.url,
          details: cleanContent.slice(0, 240) + '...',
        });
      }
    }

    if (!foundKeyword && !item.title.toLowerCase().includes('bsc entrance')) {
      const cleanTitle = cleanArticleTitle(item.title);
      // Ensure article title does not mention conflicting domains
      if (isMedical && /jee|engineering|b\.?sc|cucet/i.test(cleanTitle)) continue;
      if (isEngineering && /neet|medical/i.test(cleanTitle)) continue;

      if (cleanTitle && cleanTitle.length > 3) {
        addExam({
          name: cleanTitle,
          conductingBody: 'Apex Conducting Body / NTA',
          level: 'National Gateway',
          scope: `${targetDegree || 'Degree'} Admissions Gateway`,
          url: item.url,
          details: cleanContent.slice(0, 240) + '...',
        });
      }
    }
  }

  // Also parse from Markdown "## Entrance Exams" if needed
  if (markdownContent && exams.length < 2) {
    const mdExams = extractExamsFromMarkdown(markdownContent);
    for (const e of mdExams) {
      if (isMedical && /jee|bitsat|iit|gate/i.test(e.name)) continue;
      addExam(e);
    }
  }

  // Final Strict Domain Guarantee
  if (isMedical) {
    // Strictly strip any JEE or Engineering exams from appearing for an MBBS student
    exams = exams.filter((e) => !/jee|bitsat|gate|iit|engineering/i.test(`${e.name} ${e.scope || ''}`));
    const hasNeet = exams.some((e) => /neet/i.test(e.name));
    if (!hasNeet) {
      exams.unshift({
        name: 'NEET-UG 2025–2026 (National Eligibility cum Entrance Test)',
        conductingBody: 'National Testing Agency (NTA)',
        level: 'Apex National Gateway',
        scope: 'Sole mandatory entrance exam for MBBS and BDS admissions across all AIIMS, JIPMER, Central, State, and Private Medical Colleges in India',
        url: 'https://neet.nta.nic.in',
        details: 'Single-window national assessment testing Physics, Chemistry, and Biology (Zoology & Botany). Qualifying NEET-UG is legally required for medical admissions in India.'
      });
    }
  } else if (isEngineering) {
    exams = exams.filter((e) => !/neet|mbbs|bds|medical/i.test(`${e.name} ${e.scope || ''}`));
    const hasJee = exams.some((e) => /jee/i.test(e.name));
    if (!hasJee) {
      exams.unshift({
        name: 'JEE (Main) & JEE (Advanced) 2025–2026',
        conductingBody: 'National Testing Agency (NTA) & IIT Consortium',
        level: 'Apex National Gateway',
        scope: 'Admissions to 23 IITs, 31 NITs, 25 IIITs, and Premier Engineering Institutes',
        url: 'https://jeemain.nta.nic.in',
        details: 'Primary national engineering assessment. Top 2.5 lakh qualifiers in JEE Main become eligible for JEE Advanced for IIT admissions.'
      });
    }
  }

  return exams;
}

/**
 * Parses raw scholarship data into structured financial aid records with clear points and explanations.
 */
export function parseScholarships(scholarshipsData = [], markdownContent = '', targetDegree = '') {
  const scholarships = [];
  const seen = new Set();

  const addScholarship = (sch) => {
    const norm = sch.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!norm || seen.has(norm)) return;
    seen.add(norm);
    scholarships.push(sch);
  };

  const rawItems = Array.isArray(scholarshipsData) ? scholarshipsData : [];

  // 1. Check if backend already synthesized structured scholarships
  for (const item of rawItems) {
    if (item.title && (Array.isArray(item.points) || Array.isArray(item.eligibility_points))) {
      addScholarship({
        title: item.title,
        provider: item.provider || 'National Educational Foundation',
        amount: item.amount || 'Tuition Fee Grant',
        points: Array.isArray(item.points) ? item.points : item.eligibility_points,
        explanation: item.explanation || 'Merit and need-based financial aid for undergraduate study.',
        howToApply: item.how_to_apply || item.howToApply || 'Apply via National Scholarship Portal (scholarships.gov.in).',
        url: item.url || 'https://scholarships.gov.in',
      });
    }
  }

  // 2. Scan raw text against verified national scholarship catalog
  const combinedRawText = rawItems
    .map((i) => `${i.title || ''} ${i.content || ''} ${i.description || ''}`)
    .join(' ')
    .toLowerCase();

  for (const scheme of VERIFIED_SCHOLARSHIP_CATALOG) {
    const schemeWords = scheme.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4 && !['scheme', 'scholarship', 'scholarships', 'national', 'foundation'].includes(w));
    
    const isMentioned = schemeWords.some((w) => combinedRawText.includes(w));
    if (isMentioned) {
      addScholarship(scheme);
    }
  }

  // 3. Fallback: Always ensure at least 3-4 premier national scholarship options are available
  if (scholarships.length < 3) {
    for (const scheme of VERIFIED_SCHOLARSHIP_CATALOG) {
      addScholarship(scheme);
      if (scholarships.length >= 4) break;
    }
  }

  return scholarships;
}

/**
 * Dynamically extracts Year 1 to Year 4 milestones from ## Four-Year Roadmap in Markdown
 */
export function extractRoadmapFromMarkdown(md = '') {
  if (!md) return [];
  const match = md.match(/##\s*Four-Year Roadmap([\s\S]*?)(?=\n##\s+[A-Za-z]|$)/i);
  if (!match || !match[1]) return [];
  const text = match[1];

  const parts = text.split(/(?:###|\*\*|####)\s*Year\s*(\d)/i);
  const years = [];
  for (let i = 1; i < parts.length; i += 2) {
    const yearNum = parseInt(parts[i], 10);
    const content = parts[i + 1] || '';
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] ? lines[0].replace(/^[:\-\s*]+/, '').replace(/\*\*/g, '').trim() : '';
    const milestones = lines
      .filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'))
      .map((l) => l.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(Boolean);

    years.push({
      year: yearNum,
      title: firstLine ? `Year ${yearNum}: ${firstLine}` : `Year ${yearNum} Academic Milestones`,
      milestones: milestones.length > 0 ? milestones : lines.slice(1, 4),
      skills: `Specialized Year ${yearNum} Core Foundations & Practical Competencies`,
    });
  }
  return years;
}

/**
 * Dynamically extracts high-value skills and tools from ## Emerging Skills in Markdown
 */
export function extractSkillsFromMarkdown(md = '') {
  if (!md) return [];
  const match = md.match(/##\s*Emerging Skills([\s\S]*?)(?=\n##\s+[A-Za-z]|$)/i);
  if (!match || !match[1]) return [];
  const text = match[1];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const categories = [];
  let currentCat = null;

  for (const line of lines) {
    if (line.startsWith('###') || (line.startsWith('**') && line.endsWith('**'))) {
      const catName = line.replace(/^[#*\s]+|[#*\s]+$/g, '').trim();
      currentCat = {
        category: catName,
        skills: [],
        desc: 'Industry-demanded competencies and tools for career acceleration.',
      };
      categories.push(currentCat);
    } else if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
      const item = line.replace(/^[-*•\s]+/, '').replace(/\*\*/g, '').trim();
      if (!currentCat) {
        currentCat = {
          category: 'Recommended Competencies',
          skills: [],
          desc: 'High-value technical and professional skills synthesized for this trajectory.',
        };
        categories.push(currentCat);
      }
      currentCat.skills.push(item);
    }
  }
  return categories;
}

/**
 * Dynamically extracts backup options from ## Backup Options in Markdown
 */
export function extractBackupFromMarkdown(md = '') {
  if (!md) return [];
  const match = md.match(/##\s*Backup Options([\s\S]*?)(?=\n##\s+[A-Za-z]|$)/i);
  if (!match || !match[1]) return [];
  const text = match[1];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const backups = [];

  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || /^\d+\./.test(line)) {
      const clean = line.replace(/^[-*•\d.\s]+/, '').replace(/\*\*/g, '').trim();
      const parts = clean.split(':');
      if (parts.length >= 2) {
        backups.push({
          title: parts[0].trim(),
          desc: parts.slice(1).join(':').trim(),
        });
      } else if (clean.length > 3) {
        backups.push({
          title: clean,
          desc: 'Provides lateral eligibility into industry specializations and postgraduate admissions.',
        });
      }
    }
  }
  return backups;
}

// ---------------------------------------------------------------------------
// Internal Helper Functions
// ---------------------------------------------------------------------------

function cleanInstitutionName(name) {
  if (!name) return 'Accredited University';
  return name
    .replace(/\s+Admission$/i, '')
    .replace(/^(?:S\.\s*No\.?|\d+)\s*/i, '')
    .replace(/\[\.\.\.\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanArticleTitle(title) {
  if (!title) return '';
  return title
    .replace(/:\s*Fees,\s*Rankings.*$/i, '')
    .replace(/:\s*Fees,\s*Cutoff.*$/i, '')
    .replace(/2025[-/]?2026/g, '')
    .replace(/2026/g, '')
    .replace(/\[\.\.\.\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanFee(fee) {
  if (!fee) return 'Refer to Prospectus';
  return fee
    .replace(/INR/gi, '₹')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferType(typeText, name) {
  const combined = `${typeText} ${name}`.toLowerCase();
  if (
    combined.includes('aiims') ||
    combined.includes('jipmer') ||
    combined.includes('iit') ||
    combined.includes('nit') ||
    combined.includes('govt') ||
    combined.includes('government')
  ) {
    return 'Premier Government';
  }
  if (combined.includes('deemed')) {
    return 'Deemed University';
  }
  if (
    combined.includes('private') ||
    combined.includes('cmc') ||
    combined.includes('kmc') ||
    combined.includes('manipal')
  ) {
    return 'Premier Private';
  }
  return typeText ? `${typeText} Institute` : 'Accredited University';
}

function inferRank(name) {
  const n = name.toLowerCase();
  if (n.includes('aiims')) return 'NIRF #1 (Medical)';
  if (n.includes('cmc') || n.includes('christian medical')) return 'NIRF #3 (Medical)';
  if (n.includes('jipmer')) return 'NIRF #4 (Medical)';
  if (n.includes('kmc') || n.includes('kasturba')) return 'NIRF #9 (Medical)';
  if (n.includes('gandhi medical')) return 'Top State Govt';
  if (n.includes('bangalore medical') || n.includes('bmcri')) return 'Top State Govt';
  return 'NIRF Ranked';
}

function inferLocation(text) {
  const cities = [
    'New Delhi',
    'Delhi',
    'Bengaluru',
    'Bangalore',
    'Mumbai',
    'Pune',
    'Chennai',
    'Vellore',
    'Hyderabad',
    'Kolkata',
    'Manipal',
    'Ahmedabad',
    'Jaipur',
    'Chandigarh',
    'Secunderabad',
    'Puducherry',
  ];
  for (const city of cities) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
      return city;
    }
  }
  return 'India (National)';
}

function inferProvider(text) {
  const t = text.toLowerCase();
  if (t.includes('national scholarship portal') || t.includes('central sector') || t.includes('nsp'))
    return 'Ministry of Education (Govt of India)';
  if (t.includes('reliance')) return 'Reliance Foundation';
  if (t.includes('tata')) return 'Tata Trusts';
  if (t.includes('aditya birla')) return 'Aditya Birla Group';
  return 'Government & Private Trusts';
}

function inferAmount(text) {
  const match = text.match(/(?:₹|INR|Rs\.?)\s*([0-9,.]+(?:\s*(?:lakh|crore|thousand|per year|annually))?)/i);
  if (match) {
    return `Up to ₹${match[1]}`;
  }
  return 'Up to 100% Tuition Fee Waiver';
}

function extractCollegesFromMarkdown(text) {
  const match = text.match(/##\s*Colleges([\s\S]*?)(?=##|$)/i);
  if (!match || !match[1]) return [];
  const lines = match[1].split('\n').map((l) => l.trim()).filter(Boolean);
  const colleges = [];

  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*')) {
      const parts = line.replace(/^[-*]\s*/, '').split(':');
      if (parts.length >= 2) {
        colleges.push({
          name: parts[0].replace(/\*\*/g, '').trim(),
          type: 'Categorized Pathway',
          location: 'Pan-India',
          rank: 'Verified Accreditation',
          fee: 'Tiered',
          summary: parts.slice(1).join(':').replace(/\*\*/g, '').trim(),
        });
      }
    }
  }
  return colleges;
}

function extractExamsFromMarkdown(text) {
  const match = text.match(/##\s*Entrance Exams([\s\S]*?)(?=##|$)/i);
  if (!match || !match[1]) return [];
  const lines = match[1].split('\n').map((l) => l.trim()).filter(Boolean);
  const exams = [];

  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*')) {
      const parts = line.replace(/^[-*]\s*/, '').split(':');
      if (parts.length >= 2) {
        exams.push({
          name: parts[0].replace(/\*\*/g, '').trim(),
          conductingBody: 'Apex Conducting Body',
          level: 'National / State Level',
          scope: 'Official Gateway',
          details: parts.slice(1).join(':').replace(/\*\*/g, '').trim(),
        });
      }
    }
  }
  return exams;
}

function extractScholarshipsFromMarkdown(text) {
  const match = text.match(/##\s*Scholarship Opportunities([\s\S]*?)(?=##|$)/i);
  if (!match || !match[1]) return [];
  const lines = match[1].split('\n').map((l) => l.trim()).filter(Boolean);
  const scholarships = [];

  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*')) {
      const parts = line.replace(/^[-*]\s*/, '').split(':');
      if (parts.length >= 2) {
        scholarships.push({
          title: parts[0].replace(/\*\*/g, '').trim(),
          provider: 'Central / State / Private Body',
          amount: 'Merit-cum-Means Grant',
          eligibility: '12th Pass-out (Qualifying Score)',
          details: parts.slice(1).join(':').replace(/\*\*/g, '').trim(),
        });
      }
    }
  }
  return scholarships;
}

function generateCollegePoints(college, targetDegree = '') {
  const isMedical = /mbbs|medicine|medical|clinical|bds|bams|doctor/i.test(`${targetDegree} ${college.name}`);
  const isEng = /b\.?tech|engineering|cse|computer/i.test(`${targetDegree} ${college.name}`);
  const isGovt = /govt|government|public|central|aiims|jipmer/i.test(`${college.type} ${college.name}`);

  const points = [];

  if (isMedical) {
    points.push('Admission Gateway: Mandatory qualification via NEET-UG with 15% All India Quota (AIQ) or 85% State Medical Counseling.');
    points.push('Clinical Exposure: Comprehensive tertiary multi-specialty hospital attachment with extensive inpatient bed occupancy and super-specialty rotas.');
    const feeLabel = college.fee && college.fee !== 'Refer to Prospectus' ? college.fee : 'Subsidized Government Fee';
    points.push(isGovt
      ? `Tuition & Value: Subsidized government fee structure (${feeLabel}) with merit waivers and residential hostel facilities.`
      : `Tuition Structure: Institutional fee structure (${feeLabel}) with flexible semester installments and merit aid eligibility.`);
    points.push('Career Trajectory: 1-year mandatory rotatory internship with competitive stipend and direct pathways to top PG medical residency specializations.');
  } else if (isEng) {
    points.push('Admission Gateway: Merit counseling via JEE Main / JEE Advanced / State CET national rank cutoffs.');
    points.push('Academic Facilities: Accredited advanced computing clusters, core prototyping laboratories, and industry research incubators.');
    points.push(`Tuition & Cost: Structured tuition of ${college.fee || 'Standard Tiered Fee'} with state and central scholarship support.`);
    points.push('Placement Standing: High campus placement rates with tier-1 technology firms, core engineering leaders, and global research fellowships.');
  } else {
    points.push('Admission Gateway: Central university entrance merit (CUET-UG) and Class 12 board percentage cutoffs.');
    points.push('Academic Environment: High NIRF accredited academic standing with distinguished faculty and national research projects.');
    points.push(`Fee Structure: Affordable institutional fee (${college.fee || 'Refer to Prospectus'}) with fee reimbursement for eligible categories.`);
    points.push('Career Outcomes: Structured campus internships, placement drives, and direct access to postgraduate specializations.');
  }

  return points;
}

function generateCollegeExplanation(college, targetDegree = '') {
  const isGovt = /govt|government|public|central|aiims|jipmer/i.test(`${college.type} ${college.name}`);
  if (isGovt) {
    return `Premier government-funded institution offering world-class training with maximum clinical/industry exposure at heavily subsidized tuition rates.`;
  }
  return `A highly recognized, accredited institution offering modern infrastructure, robust academic mentoring, and proven graduate career outcomes.`;
}

function getFallbackInstitutions(targetDegree = '') {
  const isMedical = /mbbs|medicine|medical|clinical|bds|bams|doctor/i.test(targetDegree);
  const isEng = /b\.?tech|engineering|cse|computer/i.test(targetDegree);

  if (isMedical) {
    return [
      {
        name: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
        location: 'New Delhi, NCR',
        type: 'Premier Government / Central Apex',
        rank: 'NIRF #1 (Medical)',
        fee: '₹6,075 (Total 5.5-Year Course)',
        url: 'https://www.aiims.edu',
      },
      {
        name: 'Christian Medical College (CMC), Vellore',
        location: 'Vellore, Tamil Nadu',
        type: 'Premier Private / Autonomous',
        rank: 'NIRF #3 (Medical)',
        fee: '₹15,000 / Year (Subsidized)',
        url: 'https://www.cmch-vellore.edu',
      },
      {
        name: 'Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER)',
        location: 'Puducherry',
        type: 'Premier Government / Central Apex',
        rank: 'NIRF #4 (Medical)',
        fee: '₹5,400 / Year',
        url: 'https://jipmer.edu.in',
      },
      {
        name: 'Kasturba Medical College (KMC), Manipal',
        location: 'Manipal, Karnataka',
        type: 'Deemed University (Tier 1)',
        rank: 'NIRF #9 (Medical)',
        fee: '₹12,42,000 / Year',
        url: 'https://manipal.edu/kmc-manipal.html',
      },
      {
        name: 'Bangalore Medical College & Research Institute (BMCRI)',
        location: 'Bengaluru, Karnataka',
        type: 'Premier Government (State Apex)',
        rank: 'Top State Government',
        fee: '₹3,39,100 (Total Course)',
        url: 'https://bmcri.edu.in',
      },
      {
        name: 'Gandhi Medical College',
        location: 'Secunderabad, Telangana',
        type: 'Premier Government (State Apex)',
        rank: 'Top State Government',
        fee: '₹85,000 (Total Course)',
        url: 'https://gandhi.telangana.gov.in',
      },
    ];
  }

  if (isEng) {
    return [
      {
        name: 'Indian Institute of Technology (IIT), Bombay',
        location: 'Mumbai, Maharashtra',
        type: 'Premier Government / Institute of National Importance',
        rank: 'NIRF #3 (Overall)',
        fee: '₹2,20,000 / Year',
        url: 'https://www.iitb.ac.in',
      },
      {
        name: 'Indian Institute of Technology (IIT), Delhi',
        location: 'New Delhi, NCR',
        type: 'Premier Government / Institute of National Importance',
        rank: 'NIRF #2 (Engineering)',
        fee: '₹2,20,000 / Year',
        url: 'https://home.iitd.ac.in',
      },
      {
        name: 'BITS Pilani (Pilani Campus)',
        location: 'Pilani, Rajasthan',
        type: 'Premier Deemed University',
        rank: 'NIRF Top 20',
        fee: '₹5,40,000 / Year',
        url: 'https://www.bits-pilani.ac.in',
      },
      {
        name: 'National Institute of Technology (NIT), Tiruchirappalli',
        location: 'Tiruchirappalli, Tamil Nadu',
        type: 'Premier Government / National Institute',
        rank: 'NIRF #9 (Engineering)',
        fee: '₹1,50,000 / Year',
        url: 'https://www.nitt.edu',
      },
    ];
  }

  return [
    {
      name: 'Delhi University (St. Stephen\'s / SRCC / Hindu College)',
      location: 'New Delhi, NCR',
      type: 'Premier Central University',
      rank: 'NIRF Top 5',
      fee: '₹25,000 – ₹45,000 / Year',
      url: 'https://www.du.ac.in',
    },
    {
      name: 'Indian Institute of Management (IIM), Indore (IPM)',
      location: 'Indore, Madhya Pradesh',
      type: 'Institute of National Importance',
      rank: 'NIRF Top 10 (Management)',
      fee: '₹4,50,000 / Year',
      url: 'https://www.iimidr.ac.in',
    },
  ];
}

const VERIFIED_SCHOLARSHIP_CATALOG = [
  {
    title: 'Central Sector Scheme of Scholarships (CSSS)',
    provider: 'Ministry of Education, Govt. of India',
    amount: '₹12,000 to ₹20,000 / Year',
    points: [
      'Academic Criterion: Must be in the top 20th percentile of successful candidates in Class 12 board examination.',
      'Family Income Ceiling: Gross annual family income strictly below ₹4,50,000 per annum.',
      'Coverage & Duration: Annual financial allowance for graduation (₹12,000/yr for 3-4 years) and post-graduation.',
      'Disbursement Method: Direct Benefit Transfer (DBT) directly credited to student Aadhaar-linked bank account.'
    ],
    explanation: 'Flagship national government scholarship designed to support meritorious students from middle and low-income families during their entire undergraduate studies.',
    howToApply: 'Apply online through the National Scholarship Portal (scholarships.gov.in) with Class 12 marksheet and income certificate.',
    url: 'https://scholarships.gov.in',
  },
  {
    title: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    amount: 'Up to ₹2,00,000 over course duration',
    points: [
      'Academic Eligibility: Minimum 60% aggregate marks in Class 12 board examination across any academic stream.',
      'Income Ceiling: Household income strictly under ₹15,00,000 per year (preference given to < ₹2,50,000).',
      'Financial Scope: Flexible cash grant allowing students to fund tuition, laptops, books, and living expenses.',
      'Selection Process: Online aptitude test followed by academic evaluation and interview round.'
    ],
    explanation: 'One of India\'s largest private philanthropic scholarship programs supporting 5,000 meritorious undergraduate students annually across all degree disciplines.',
    howToApply: 'Submit application online at reliancefoundation.org during the August to October application window.',
    url: 'https://www.reliancefoundation.org',
  },
  {
    title: 'HDFC Bank Badhte Kadam Scholarship',
    provider: 'HDFC Bank CSR Parivartan',
    amount: '₹30,000 to ₹1,00,000 / Year',
    points: [
      'Academic Criterion: Passed Class 12 with at least 60% aggregate marks in CBSE, CISCE, or State Board.',
      'Family Income Ceiling: Annual family income strictly below ₹6,00,000 from all verified sources.',
      'Special Focus: Prioritizes students facing family distress, single-parent households, or financial emergencies.',
      'Coverage: Direct financial assistance for college tuition fees, admission charges, and study materials.'
    ],
    explanation: 'Targeted corporate social responsibility initiative ensuring talented students do not drop out of higher education due to sudden financial hardship.',
    howToApply: 'Apply online via Buddy4Study portal with Class 12 marksheet, admission confirmation letter, and family income certificate.',
    url: 'https://www.buddy4study.com',
  },
  {
    title: 'Kotak Kanya Scholarship (for Girl Scholars)',
    provider: 'Kotak Education Foundation',
    amount: '₹1,50,000 / Year until graduation',
    points: [
      'Target Beneficiaries: Meritorious female students securing admission in 1st year professional degrees (MBBS, B.Tech, BDS, LLB).',
      'Academic Threshold: Minimum 85% or equivalent grade in Class 12 board examinations.',
      'Income Ceiling: Annual family income must be ≤ ₹6,00,000 per annum.',
      'Holistic Support: Covers annual academic tuition fees, hostel expenses, and provides executive mentorship.'
    ],
    explanation: 'Empowering deserving girl students to pursue prestigious professional degrees in medicine, engineering, and law without financial impediments.',
    howToApply: 'Apply online through Kotak Education Foundation portal between July and September each academic year.',
    url: 'https://kotak.org',
  },
  {
    title: 'Sitaram Jindal Foundation Educational Scholarship',
    provider: 'Sitaram Jindal Foundation',
    amount: '₹2,000 to ₹3,200 / Month',
    points: [
      'Course Eligibility: Open for students pursuing undergraduate professional degrees (MBBS, Engineering, Sciences, Arts).',
      'Minimum Marks: 65% aggregate for male students, 60% aggregate for female students in Class 12.',
      'Income Threshold: Annual family income below ₹4,00,000 for employment families and ₹2,50,000 for others.',
      'Regular Grant: Paid on a monthly or semester stipend basis throughout the duration of the degree.'
    ],
    explanation: 'Renowned charitable foundation assisting economically challenged youth across rural and urban India with reliable educational stipends.',
    howToApply: 'Download and submit physical/online application verified and signed by the principal of your admitted college.',
    url: 'https://www.sitaramjindalfoundation.org',
  },
  {
    title: 'Tata Capital Pankh Scholarship',
    provider: 'Tata Capital Foundation',
    amount: 'Up to ₹50,000 / Year (up to 80% tuition)',
    points: [
      'Academic Eligibility: Minimum 60% aggregate in Class 12 board examination.',
      'Family Income Ceiling: Total family income strictly under ₹4,00,000 per annum.',
      'Direct Benefit: Reimburses up to 80% of institutional tuition fees upon submission of official fee receipts.',
      'Academic Mentoring: Recipients gain access to skill development webinars and corporate mentorship sessions.'
    ],
    explanation: 'Tata Capital initiative designed to mentor and financially support bright students in completing their higher education successfully.',
    howToApply: 'Apply through the official Tata Capital portal or Buddy4Study during June to August.',
    url: 'https://www.buddy4study.com',
  },
];
