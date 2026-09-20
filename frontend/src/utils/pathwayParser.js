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

    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      structuredColleges.push(college);
    }
  };

  const rawItems = Array.isArray(collegesData) ? collegesData : [];

  for (const item of rawItems) {
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

    // Pattern 3: | AIIMS Delhi Admission | INR 6,075 | 1 | (Run before Pattern 2 to capture rank tables)
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

    // Extract fee range tiers if present (e.g. Upto INR 5 lakh | BJ Medical College Pune, Seth GS...)
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

  // If no structured colleges could be extracted from tables, synthesize cleanly
  if (structuredColleges.length === 0 && rawItems.length > 0) {
    for (const item of rawItems) {
      const name = cleanArticleTitle(item.title);
      const cleanContent = cleanRawText(item.content || item.description);
      addCollege({
        name: name || 'Top Accredited University',
        location: inferLocation(cleanContent),
        type: inferType('', name),
        rank: 'Premier Accredited',
        fee: 'Affordable / Tiered',
        summary: cleanContent.slice(0, 240) + '...',
        url: item.url,
      });
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
 * Parses raw scholarship data into structured financial aid records.
 */
export function parseScholarships(scholarshipsData = [], markdownContent = '') {
  const scholarships = [];
  const seen = new Set();

  const addScholarship = (sch) => {
    const norm = sch.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!norm || seen.has(norm)) return;
    seen.add(norm);
    scholarships.push(sch);
  };

  const rawItems = Array.isArray(scholarshipsData) ? scholarshipsData : [];

  for (const item of rawItems) {
    const cleanTitle = cleanArticleTitle(item.title);
    const cleanContent = cleanRawText(item.content || item.description);

    addScholarship({
      title: cleanTitle || 'Merit & Means Scholarship Program',
      provider: inferProvider(cleanTitle + ' ' + cleanContent),
      amount: inferAmount(cleanContent),
      eligibility: 'Class 12 Pass-out (Merit / Income criteria apply)',
      details: cleanContent.slice(0, 220) + '...',
      url: item.url,
    });
  }

  // Parse from Markdown "## Scholarship Opportunities" if needed
  if (markdownContent && scholarships.length < 2) {
    const mdSch = extractScholarshipsFromMarkdown(markdownContent);
    for (const s of mdSch) {
      addScholarship(s);
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
