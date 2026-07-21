# 🤖 AI Multi-Agent Study Planner

A production-ready, full-stack **AI-powered Multi-Agent Study Planner** application built with FastAPI, Microsoft AutoGen, Groq LLM, React 18, Vite, Tailwind CSS (Dark Glassmorphism UI), React Flow, and Chart.js.

---

## 🌟 Key Features

- **Multi-Agent Architecture (Microsoft AutoGen + Groq)**:
  - **Agent 1 (Research Agent)**: Retrieves structured concepts, definitions, examples, formulas, and interview points for any study topic.
  - **Agent 2 (Summarizer Agent)**: Formats beginner-friendly study notes, quick revision bullet points, and generates React Flow compatible JSON graph nodes & edges.
  - **Agent 3 (Quiz Generator Agent)**: Generates MCQs, True/False, and Fill-in-the-Blanks questions with detailed explanations across Easy, Medium, and Hard difficulty levels.
  - **Agent 4 (Scheduler Agent)**: Receives exam target date, daily available hours, difficulty, and quiz scores to generate daily/weekly schedules. Automatically shifts study time allocation to weak subjects.

- **Adaptive Feedback Loop**:
  - Automatically recalculates study hours after every quiz submission:
    - **Score < 60%**: Increases future study hours by 50% & marks topic as High Priority.
    - **Score >= 85%**: Reduces study hours by 30% to reallocate time to weaker subjects.

- **Modern Glassmorphism UI**:
  - Dark mode design system with Framer Motion micro-animations, progress rings, and interactive Chart.js visualizations.
  - Interactive **Mind Map Visualizer** powered by `@xyflow/react`.
  - **Bonus Features**: PDF Export, Text-to-Speech Voice Summary, AI Study Search, Study Streak Counter, and Revision Countdown.

---

## 🏗 Project Architecture

```
d:/Triton/
├── backend/
│   ├── agents/
│   │   ├── autogen_manager.py     # Multi-Agent Orchestrator
│   │   ├── research_agent.py      # Agent 1: Research
│   │   ├── summarizer_agent.py    # Agent 2: Notes & MindMap
│   │   ├── quiz_agent.py          # Agent 3: Quiz Generator
│   │   └── scheduler_agent.py     # Agent 4: Adaptive Scheduler
│   ├── database/
│   │   ├── base.py
│   │   └── session.py             # SQLite SQLAlchemy engine
│   ├── models/
│   │   └── models.py              # Users, Subjects, StudyPlans, Summaries, Quizzes, QuizResults
│   ├── routes/
│   │   ├── agent_pipeline.py      # /research, /summarize, /generate-mindmap, /generate-quiz, /generate-plan
│   │   ├── analytics.py           # /analytics
│   │   ├── auth.py                # /register, /login, /profile
│   │   ├── dashboard.py           # /dashboard
│   │   ├── quiz.py                # /submit-quiz (Feedback Loop Trigger)
│   │   └── subjects.py            # /subjects
│   ├── schemas/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── services/
│   │   ├── auth.py                # PyJWT & bcrypt hashing
│   │   └── groq_client.py         # Groq LLM integration & mock fallback
│   ├── config.py
│   ├── main.py                    # FastAPI application entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI Cards, MindMap, Quiz, Charts
│   │   ├── context/               # AuthContext, ThemeContext, ToastContext
│   │   ├── hooks/                 # useSpeech (Text-to-Speech)
│   │   ├── pages/                 # Dashboard, Subjects, Planner, Summary, Mindmap, Quiz, Analytics, Settings
│   │   ├── services/              # Axios API client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚡ Setup & Local Execution Guide

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env
cp .env.example .env

# Run FastAPI Server
python main.py
# or: uvicorn main:app --reload --port 8000
```

Backend will start at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install

# Start Vite Development Server
npm run dev
```

Frontend will start at: `http://localhost:3000`

---

## 🔑 Environment Variables (.env)

```env
SECRET_KEY=supersecretjwtkey_change_in_production_12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./study_planner.db
```

---

## 🚀 API Endpoint Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register new user & acquire JWT |
| `POST` | `/login` | User login |
| `GET` | `/profile` | Fetch active user profile |
| `POST` | `/subjects` | Add new study subject |
| `GET` | `/subjects` | List user subjects |
| `POST` | `/research` | Trigger Agent 1 Research |
| `POST` | `/summarize` | Trigger Agent 2 Notes & MindMap |
| `POST` | `/generate-mindmap` | Trigger Agent 2 React Flow MindMap |
| `POST` | `/generate-quiz` | Trigger Agent 3 Quiz Master |
| `POST` | `/submit-quiz` | Submit quiz score & **trigger Agent 4 Feedback Loop** |
| `POST` | `/generate-plan` | Trigger Agent 4 Initial Schedule |
| `GET` | `/study-plan` | Fetch student study schedule matrix |
| `GET` | `/dashboard` | Fetch dashboard analytics & metrics |
| `GET` | `/analytics` | Fetch detailed topic mastery charts |
