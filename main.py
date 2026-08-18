import os
import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import database

# Base Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
INDEX_HTML = os.path.join(TEMPLATES_DIR, "index.html")

# Lifespan context manager for startup / shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield

# Initialize FastAPI App
app = FastAPI(
    title="BodyTag - Workout Muscle Tracker & Heatmap",
    description="Python API for muscle volume tracking, recovery decay, and human body heatmaps.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# --- Pydantic Data Models ---
class WeekCreate(BaseModel):
    title: Optional[str] = None

class DayCreate(BaseModel):
    week_id: int
    title: Optional[str] = None
    real_date: Optional[str] = None
    notes: Optional[str] = ""

class DayUpdate(BaseModel):
    title: Optional[str] = None
    real_date: Optional[str] = None
    notes: Optional[str] = ""

class WorkoutLogCreate(BaseModel):
    exercise_id: str
    day_id: Optional[int] = None
    sets: int = Field(..., ge=1, le=100)
    reps: int = Field(default=10, ge=1, le=500)
    weight: float = Field(default=0.0, ge=0.0)
    rpe: float = Field(default=8.0, ge=1.0, le=10.0)
    notes: Optional[str] = ""
    custom_time: Optional[str] = None

class CustomExerciseCreate(BaseModel):
    id: str
    name: str
    name_th: Optional[str] = None
    category: str
    primary: List[str]
    secondary: Optional[List[str]] = []

# --- Web Routes ---
@app.get("/")
async def render_home():
    """Serve the main interactive workout tracker web page."""
    return FileResponse(INDEX_HTML)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Return 204 No Content for favicon request if not present."""
    from fastapi import Response
    return Response(status_code=204)

# --- API Endpoints ---
@app.get("/api/exercises")
def list_exercises():
    """List all exercises (predefined and custom)."""
    return database.get_all_exercises()

@app.post("/api/exercises")
def create_exercise(exercise: CustomExerciseCreate):
    """Add a new custom strength training exercise."""
    return database.add_exercise(exercise.model_dump() if hasattr(exercise, 'model_dump') else exercise.dict())

# --- Weeks & Days Endpoints ---
@app.get("/api/weeks")
def list_weeks():
    """Fetch all workout weeks with their nested workout days and muscle summaries."""
    return database.get_all_weeks_with_days()

@app.post("/api/weeks")
def create_week(week: WeekCreate):
    """Create a new workout week."""
    return database.add_week(title=week.title)

@app.delete("/api/weeks/{week_id}")
def remove_week(week_id: int):
    """Delete a week and all its associated days and logs."""
    database.delete_week(week_id)
    return {"status": "success", "deleted_week_id": week_id}

@app.post("/api/days")
def create_day(day: DayCreate):
    """Create a new workout day in a specified week."""
    return database.add_day(
        week_id=day.week_id,
        title=day.title,
        real_date=day.real_date,
        notes=day.notes
    )

@app.put("/api/days/{day_id}")
def update_day_info(day_id: int, day: DayUpdate):
    """Update workout day title, real date reference, or notes."""
    database.update_day(
        day_id=day_id,
        title=day.title,
        real_date=day.real_date,
        notes=day.notes
    )
    return {"status": "success", "updated_day_id": day_id}

@app.delete("/api/days/{day_id}")
def remove_day(day_id: int):
    """Delete a day and all its logged exercises."""
    database.delete_day(day_id)
    return {"status": "success", "deleted_day_id": day_id}

# --- Workout Logs Endpoints ---
@app.get("/api/logs")
def list_workout_logs(week_id: Optional[int] = None, day_id: Optional[int] = None, limit: int = 200):
    """Fetch workout logs optionally filtered by week_id or day_id."""
    return database.get_logs(week_id=week_id, day_id=day_id, limit=limit)

@app.post("/api/logs")
def log_workout(log: WorkoutLogCreate):
    """Log an exercise workout set entry under a specific day."""
    log_id = database.add_log(
        exercise_id=log.exercise_id,
        day_id=log.day_id,
        sets=log.sets,
        reps=log.reps,
        weight=log.weight,
        rpe=log.rpe,
        notes=log.notes,
        custom_time=log.custom_time
    )
    return {"status": "success", "log_id": log_id}

@app.delete("/api/logs/{log_id}")
def remove_workout_log(log_id: int):
    """Delete a specific workout log entry."""
    database.delete_log(log_id)
    return {"status": "success", "deleted_id": log_id}

@app.post("/api/logs/reset")
def reset_all_logs(week_id: Optional[int] = None, day_id: Optional[int] = None):
    """Clear workout logs (scopeable by week or day)."""
    database.reset_logs(week_id=week_id, day_id=day_id)
    return {"status": "success", "message": "Workout logs cleared"}

@app.get("/api/stats")
def get_muscle_stats(week_id: Optional[int] = None, day_id: Optional[int] = None):
    """
    Get aggregated muscle heatmap data, effective volume,
    hypertrophy landmarks (MEV/MAV/MRV), and recovery decay percentages
    scoped to the selected week or day.
    """
    return database.calculate_stats(week_id=week_id, day_id=day_id)

if __name__ == "__main__":
    database.init_db()
    print("Starting BodyTag Workout Muscle Tracker at http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
