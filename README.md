# Tradzo — India's Smartest Investment Platform

A full-stack trading platform with a vanilla JS frontend and a Node.js/Express/MongoDB backend.

## Project Structure

```
tredzo/
├── frontend/         # Static HTML/CSS/JS frontend
│   ├── index.html    # Entry point
│   ├── app.js        # Vanilla JS app logic (state, views, events)
│   ├── styles.css    # Global styles
│   ├── Tradzo.jsx    # React version (alternative implementation)
│   └── package.json  # Frontend dev-server config
│
└── backend/          # Node.js/Express API
    ├── server.js     # Express entry point, routes, middleware
    ├── package.json  # Backend dependencies
    ├── .env.example  # Environment variables template
    └── ...           # config/, models/, routes/ (add as needed)
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # Fill in your secrets
npm install
npm run dev            
```

### Frontend

```bash
cd frontend
npm install
npm run dev            
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `PORT`              | API server port                      |
| `CLIENT_URL`        | Frontend URL for CORS                |
| `MONGO_URI`         | MongoDB connection string            |
| `JWT_SECRET`        | JWT signing secret                   |
| `ALPHA_VANTAGE_KEY` | Stock data API key                   |
| `SMTP_*`            | Email notification credentials       |
| `OPENAI_API_KEY`    | Optional AI suggestion key           |

## Tech Stack

- **Frontend:** Vanilla HTML + CSS + JavaScript (single-page app with state management)
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcryptjs, node-cron

## GitHub Repository
    https://github.com/ashishkompalwar-dev/Tradzo 
