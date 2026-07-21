import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.base import Base
from database.session import engine
from routes import auth, subjects, agent_pipeline, quiz, dashboard, analytics

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
