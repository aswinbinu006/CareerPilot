# CareerPilot AI — Frontend Web Application

> A high-performance, aesthetically refined Single Page Application (SPA) built with **React 18**, **Vite**, **Tailwind CSS**, **GSAP**, and **Lenis Scroll**.

---

## Design System & Aesthetics

CareerPilot AI uses an editorial, high-trust design system tailored for Indian students and parents:

- **Color Palette**:
  - `bg-cream` (`#FAF8F5`): Warm, paper-like background that eliminates eye strain.
  - `bg-surface` (`#FFFFFF`): Crisp container surfaces with subtle border contrast.
  - `text-charcoal` (`#18181B`): Deep ink-black typography for sharp readability.
  - `accent` / `amber` (`#D97706`): Warm academic gold used for highlights, progress bars, and active states.
  - `accent-tint` (`rgba(217, 119, 6, 0.12)`): Distinct selection state background fill for cards and chips.
- **Typography**:
  - **Headings**: `Outfit` (modern, geometric, warm authority).
  - **Body & UI**: `Manrope` (clean, highly legible contemporary sans-serif).
- **Motion & Polish**:
  - **Lenis Scroll**: Ultra-smooth inertia scrolling across long career guidance reports.
  - **GSAP Animations**: Micro-animations on card entrance, step transitions, and confidence score gauges.

---

## Key Features

### 1. 8-Step Interactive Student Assessment Wizard
A guided step-by-step form capturing:
1. **Personal Information** (Name, Email)
2. **12th Stream** (PCM, PCB, Commerce, Arts)
3. **Board Examination Marks / Percentage**
4. **Favorite Subjects** (with custom chip addition)
5. **Passions, Hobbies & Natural Interests**
6. **Annual Tuition Budget** (Tiered from Affordable to Flexible)
7. **Preferred College Location** (Major metros, state-specific, or open)
8. **Career Goals & Aspirations**

*All selectable options feature prominent active states with accent fill, checkmark icons, and glowing border rings for instant feedback.*

---

### 2. Comprehensive Career Guidance Report
Renders the synthesized Markdown report into structured UI sections:
- **Aptitude Confidence Gauge**: Dynamic visual score bar (e.g., 95% Confidence).
- **Target Degree & Career Roles**: Core recommended degree with industry focus.
- **Why This Fits You**: Clear rationale linking marks, subjects, and passions to industry demand.
- **Entrance Exams Schedule**: National and state exams, conducting bodies, and timeline.
- **Tiered College Recommendations**: Top Government, Premier Private, and Budget-Friendly institutions.
- **Scholarships & Financial Aid**: Applicable merit and need-based programs.
- **4-Year Actionable Milestone Roadmap**: Year 1 to Year 4 execution timeline.
- **Backup & Alternative Options**: 2 viable parallel degrees if primary plans shift.

---

### 3. Contextual AI Career Mentor
- **Conversational Mentor Drawer**: Slide-over or modal chat window that remembers the student's completed assessment.
- **Dynamic Quick-Prompt Pills**: Stream-specific starter questions (e.g. *"Why did you recommend this career?"*, *"Best colleges for my budget"*, *"Make me a 60-day study plan"*).
- **Auto-Scrolling Chat Area**: Smooth auto-scroll keeping the latest agent responses visible.
- **Multi-Agent Intent Routing**: Dispatches college queries to the Pathway Agent and timetable queries to the Guidance Agent.

---

### 4. Smart Security & Session Management
- **Inactivity Auto-Logout**: Monitors student interactions (mouse movement, keypresses, clicks); automatically terminates session and clears tokens after **60 minutes of inactivity**.
- **Tab-Close Protection**: Detects when a student closes the browser tab or window, ensuring sessions are not left exposed on public or shared computers.
- **Immediate Validation**: Interrogates `/auth/validate` on mount to guarantee user records exist in the database.

---

## Directory Structure

```text
frontend/
├── public/               # Static assets, favicon, logos
├── src/
│   ├── components/
│   │   ├── assessment/   # Step1 to Step8 assessment form components
│   │   ├── common/       # Button, Input, Modal, Card, Navbar, Footer
│   │   ├── mentor/       # Career Mentor chat drawer & message components
│   │   └── report/       # Report renderer, confidence gauge, and export tools
│   ├── context/          # AuthContext (JWT storage, auto-logout, login/logout state)
│   ├── hooks/            # useIdleTimer (60-min inactivity listener)
│   ├── pages/            # Home, Assessment, Report, Login, Signup, NotFound
│   ├── services/         # api.js (Axios/fetch client with JWT headers)
│   ├── App.jsx           # App routing & context providers
│   ├── index.css         # Tailwind directives, color tokens, and Google Fonts
│   └── main.jsx          # Root React entry point
├── package.json          # Node dependencies and scripts
├── tailwind.config.js    # Design tokens, fonts, and theme extensions
└── vite.config.js        # Vite build and proxy settings
```

---

## Development Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` or `.env.local` file to point to your live backend:
```ini
# Default points to local FastAPI backend on port 8000
VITE_API_BASE_URL=http://localhost:8000
```
*(In production, set this to your deployed backend URL, e.g. `https://careerpilot-backend.onrender.com`)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build

To build the optimized static production bundle:
```bash
npm run build
```
This generates compiled HTML, CSS, and JS in the `dist/` directory ready to be served by any CDN or static hosting platform (Vercel, Netlify, Cloudflare Pages).

To preview the production build locally:
```bash
npm run preview
```
