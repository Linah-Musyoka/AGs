# Deployment Guide: DELIN Premium Grading System

## 1. Prerequisites
- Node.js 20+
- GEMINI_API_KEY
- Render, Railway, or Vercel account

## 2. Configuration
Create a `.env` file with:
```env
GEMINI_API_KEY=your_key
JWT_SECRET=your_jwt_secret
APP_URL=https://your-app.render.com
```

## 3. Local Setup
```bash
npm install
npm run dev
```

## 4. Production Deployment
### Render / Railway
1. Push code to GitHub.
2. Link repository to Render/Railway.
3. Set Start Command: `node dist/server.js`
4. Ensure `npm run build` is part of the build pipeline.

### Cloud Run (AI Studio)
This app is pre-configured for Cloud Run. Ensure secrets are mapped to environment variables in the console.

## 5. Security Notes
- Kenyan Data Protection Act Compliant: User data is encrypted at rest.
- No PII is exposed in AI prompt context other than essential answer text.
