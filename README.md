# AI-Based Multilingual Mass Communication & Public Awareness Management Platform

A full-stack platform for creating, translating, and distributing public awareness campaigns across multiple languages and channels, with AI-assisted content generation and analytics.

## Features

- **Audience management & segmentation** — organize recipients into targeted groups
- **AI content generation** — draft campaign messaging with an LLM
- **Translation** — localize content across languages (Indic language support included)
- **Personalization & review** — tailor and approve content before send
- **Multi-channel distribution** — email, SMS, WhatsApp, and push notifications
- **Delivery tracking & sentiment analysis** — monitor reach and feedback
- **Analytics dashboard** — visualize campaign performance

## Tech Stack

**Frontend**
- Next.js 16 (React 19)
- Tailwind CSS 4
- Recharts (analytics visualizations)
- Axios

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy 2 + Alembic (migrations)
- FastAPI-Users (auth) with JWT (python-jose) and bcrypt password hashing
- Celery + Redis (background tasks)
- PostgreSQL (async via `asyncpg`) — SQLite (`aiosqlite`) supported for local dev

## Project Structure

```
campaign-app/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # config, database setup
│   │   ├── models/       # SQLAlchemy models (user, campaign)
│   │   └── services/     # LLM content generation, translation
│   ├── alembic/          # DB migrations
│   ├── requirements.txt
│   └── .env.example      # copy to .env and fill in your values
└── frontend/
    ├── app/ or pages/    # Next.js routes
    └── package.json
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # then fill in real values
alembic upgrade head          # run DB migrations

uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000` (docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:3000`.

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the required values (database URL, secret keys, LLM API keys, messaging provider credentials, etc.). **Never commit `.env` to version control.**

## License

TBD
