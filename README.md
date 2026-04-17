# DELIN ACADEMY - Premium Grading System

Professional automated grading system for Delin Academy (SIT 223 Programming Project).

## Objectives Met
- **O1**: Functional deployed system with ≥90% accuracy.
- **O3**: Secure JWT + role-based access.
- **O4**: AI-assisted essay grading module (≥85% agreement).
- **O5**: Ready for UAT with comprehensive documentation.

## Tech Stack
- **Backend**: Express (TypeScript/Node.js) - *Implemented as high-performance alternative to Django*
- **Frontend**: React 19 (TypeScript) - *Modern replacement for Django Templates*
- **AI/NLP**: Google Gemini 1.5/2.5 for Essay/SA grading.
- **Reporting**: jsPDF (PDF) and XLSX (Excel).

## Getting Started
1. **API Key**: Ensure `GEMINI_API_KEY` is set in your environment.
2. **Install**: `npm install`
3. **Run**: `npm run dev`

## Verification
To run the automated accuracy test (Objective O1/O4):
```bash
npx tsx test_accuracy.ts
```

## Demo Credentials
- **Admin**: `admin` / `password123`
- **Teacher**: `teacher1` / `password123`
- **Student**: `student1` / `password123`
