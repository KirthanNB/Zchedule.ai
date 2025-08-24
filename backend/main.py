import os
from uuid import uuid4
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from crew.crew import build_schedule
from models import GenerateRequest
from dotenv import load_dotenv
import supabase
import traceback

load_dotenv()

app = FastAPI()

# CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_client = supabase.create_client(
    os.getenv("SUPABASE_URL", "https://xxxx.supabase.co"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
)

@app.get("/")
def root():
    return {"message": "Chronos AI Coach API – POST /generate"}

@app.post("/generate")
def generate_schedule(req: GenerateRequest):
    # 1️⃣ Build the AI schedule
    schedule = build_schedule(req.dict())

    # 2️⃣ Generate a deterministic user_id (UUID v5) from the email
    user_id = uuid4()  # or later: real auth user_id

    # 3️⃣ Persist (optional stub)
    try:
        supabase_client.table("schedules").insert({
            "user_id": str(user_id),
            "user_profile": req.dict(),
            "generated_schedule": schedule,
        }).execute()
    except Exception:
        # swallow and log – demo only
        pass

    # 4️⃣ Return to frontend
    return schedule

@app.exception_handler(Exception)
async def debug_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": traceback.format_exc()},
    )