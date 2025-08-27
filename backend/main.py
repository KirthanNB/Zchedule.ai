import os
from uuid import uuid4
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from crew.crew import build_schedule
from dotenv import load_dotenv
import supabase
import traceback
from pydantic import BaseModel

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

# Initialize Supabase client
supabase_client = None
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if supabase_url and supabase_key:
        supabase_client = supabase.create_client(supabase_url, supabase_key)
        print("Supabase client initialized successfully")
    else:
        raise ValueError("Supabase credentials not found in environment variables")
except Exception as e:
    print(f"Failed to initialize Supabase client: {e}")
    supabase_client = None

class GenerateRequest(BaseModel):
    user_id: str

@app.get("/")
def root():
    return {"message": "ZcheduleAI Coach API – POST /generate"}

@app.post("/generate")
def generate_schedule(req: GenerateRequest):
    try:
        print(f"Request received for user_id: {req.user_id}")
        
        if supabase_client is None:
            raise ValueError("Supabase client not initialized. Check environment variables.")
        
        # Fetch user profile from Supabase
        response = supabase_client.table("user_profiles").select("*").eq("user_id", req.user_id).execute()
        
        if not response.data or len(response.data) == 0:
            return {"error": f"No profile found for user_id: {req.user_id}"}
        
        user_profile = response.data[0]
        print(f"Found user profile for {user_profile.get('full_name', 'Unknown')}")
        
        # --- Log what is being exported to Crew ---
        print("Exporting the following dictionary to Crew:")
        for key, value in user_profile.items():
            print(f"  {key}: {value}")
        print("-" * 50)
        
        # Build schedule using Crew
        schedule = build_schedule(user_profile)
        return schedule
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in generate_schedule: {error_trace}")
        return {"error": f"Failed to generate schedule: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
