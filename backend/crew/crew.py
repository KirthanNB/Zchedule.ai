import os, json, re
from crewai import Crew, Agent, Task
from langchain_groq import ChatGroq

llm = ChatGroq(model="groq/llama3-70b-8192", groq_api_key=os.getenv("GROQ_API_KEY"))

# --- Helper: build a 24-hour grid for the week -----------------------------

def build_schedule(user_profile: dict) -> list:
    """
    Returns a 7-day JSON timetable:
    [
      {"day": "Monday", "activities": [...]},
      ...
    ]
    """

    # --- 1) Context extraction ------------------------------------------------
    role          = "Student" if "student" in user_profile.get("shortTermGoals", "").lower() else "Professional"
    wake          = user_profile.get("wakeUpTime", "07:00")
    chronotype    = user_profile.get("sleepPreference", "morning_person")
    deep_style    = user_profile.get("focusPreference", "deep_work")
    fixed_blocks  = user_profile.get("fixedCommitments", [])
    short_goal    = user_profile.get("shortTermGoals", "")
    long_goal     = user_profile.get("longTermGoals", "")
    bed_time      = user_profile.get("bedTime", "22:00")

    # --- 2) Prompts ----------------------------------------------------------
    life_coach = Agent(
        role="Senior Life Coach & Productivity Strategist",
        goal="Create hyper-personalised weekly guidelines",
        backstory="20-year expert optimising energy, chronotypes, and goals.",
        llm=llm,
        allow_delegation=False,
    )

    scheduler = Agent(
        role="Master Micro-Scheduler",
        goal="Emit a strict JSON timetable for 7 days, minute-perfect.",
        backstory="Constraint-satisfaction wizard.",
        llm=llm,
        allow_delegation=False,
    )

    profile_str = f"""
Role: {role}
Wake-up: {wake}
Bed-time: {bed_time}
Chronotype: {chronotype}
Deep-work style: {deep_style}
Short-term goal: {short_goal}
Long-term goal: {long_goal}
Fixed commitments: {json.dumps(fixed_blocks)}
"""

    guideline_task = Task(
        description=f"""
Craft PERSONALISED daily rhythm bullets for a {role.lower()} who wakes at {wake} and sleeps at {bed_time}.
Include:
• 3 meals with realistic times
• 30-45 min exercise slot
• 1-2 deep-work blocks (90-120 min each)
• 30 min daily review for short-term goal
• 60 min weekly session for long-term goal
• all fixed commitments must remain untouched
""",
        expected_output="Bullet list of daily guidelines per weekday",
        agent=life_coach,
    )

    schedule_task = Task(
        description=f"""
Using the guidelines above, generate a JSON array **exactly** like:

[
  {{"day":"Monday","activities":[
    {{"start_time":"05:00","end_time":"05:30","activity":"Wake-up & Hydrate"}},
    ...
  ]}},
  ...
]

• All 7 days must be present  
• Use 24-hour HH:MM format  
• Respect fixed commitments exactly  
• Meals: breakfast 30 min, lunch 60 min, dinner 60 min  
• Exercise 30-45 min  
• Deep-work ≥ 90 min  
• Daily review 30 min  
• Long-term goal 60 min on Sunday  
""",
        expected_output="Valid JSON array",
        agent=scheduler,
        context=[guideline_task],
    )

    crew = Crew(agents=[life_coach, scheduler], tasks=[guideline_task, schedule_task], verbose=False)
    result = crew.kickoff()

    # Strip markdown fences
    raw = re.sub(r"```(?:json)?", "", str(result)).strip()
    return json.loads(raw)
