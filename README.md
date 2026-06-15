# ClinicalAI Coder ⚕️

A frontend demo tool that analyzes clinical notes and extracts diagnoses, 
symptoms, vitals, ICD-10 diagnosis codes, and CPT procedure codes from 
unstructured medical text.

Built as a pre-hackathon prototype before the CodaMetrix Calling Hackathon 
— June 2026, Boston MA.

🔗 Live demo: https://clinical-note-summarizer-rosy.vercel.app

---

## What It Does

- Paste any clinical note (ED note, discharge summary, progress note)
- Extracts diagnoses, presenting symptoms, and vitals automatically
- Maps findings to ICD-10 and CPT billing codes
- Measure acuity level (Critical / Moderate / Low)
- One-click copy of all codes for billing workflow integration
- Three built-in sample notes (STEMI, Pneumonia, Meningitis)

---

## Why I Built This

Medical coders spend hours manually reviewing hundreds of clinical notes per day 
to assign billing codes. Small errors cost hospitals millions in lost or delayed 
reimbursements. This tool acts as an intelligent assistant, instantly pulling the 
most accurate codes from patient notes to speed up the workflow and protect 
hospital revenue.

This served as my preparation project before competing at the CodaMetrix 
Calling Hackathon, where the challenge was clinical note classification.

---

## Tech Stack

- React 18
- CSS custom properties (no UI library)
- Keyword-based NLP extraction engine
- Deployed on Vercel

---

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

---

## Extending with a Real AI API

The extraction logic in `App.jsx` can be replaced with a real API call:

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Extract diagnoses, ICD-10 codes, and CPT codes from 
      this clinical note: ${note}`
    }]
  })
});
```

---

## Author

Edwin Sorto Rosales — CS @ UMass Boston, Class of 2027

Built June 2026 · CodaMetrix Hackathon Prep
