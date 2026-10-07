# SurplusLink

A demand planner and surplus pickup board for community food.

## Structure

```
surpluslink/
├── client/   → React + Vite frontend (deploy to Vercel)
├── server/   → Node + Express API   (deploy to Render)
├── docs/     → Architecture notes
└── scripts/  → Seed & cleanup utilities
```

## Quick Start

```bash
# Backend
cd server && cp .env.example .env   # fill in values
npm install && npm run dev

# Frontend
cd client && cp .env.example .env   # fill in values
npm install && npm run dev
```

## Deploy
- Frontend → Vercel (root: `client`)
- Backend  → Render Free Web Service (root: `server`, start: `node index.js`)
- Database → MongoDB Atlas M0 (free, no card)
