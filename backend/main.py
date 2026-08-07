import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.base import Base
from database.session import engine, SessionLocal
from models.models import User
from services.auth import get_password_hash
from routes import auth, subjects, agent_pipeline, quiz, dashboard, analytics, adaptive

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("StudyPlannerAPI")

# Create Database Tables automatically
logger.info("Initializing SQLite database tables...")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Multi-Agent Study Planner API",
    description="Production-Ready FastAPI application powered by Microsoft AutoGen & Groq LLM",
    version="1.0.0"
)

@app.on_event("startup")
def seed_demo_user():
    db = SessionLocal()
    try:
        demo = db.query(User).filter(User.email == "demo@studyplanner.ai").first()
        if not demo:
            hashed_pw = get_password_hash("password123")
            demo_user = User(
                name="Demo Student",
                email="demo@studyplanner.ai",
                password=hashed_pw
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo user 'demo@studyplanner.ai' created successfully.")
    except Exception as e:
        logger.warning(f"Demo user seed notice: {e}")
    finally:
        db.close()

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(agent_pipeline.router)
app.include_router(quiz.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(adaptive.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AI Multi-Agent Study Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
