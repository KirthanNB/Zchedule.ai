from pydantic import BaseModel, Field
from typing import List

class FixedCommitment(BaseModel):
    day: str
    start: str
    end: str
    title: str

class GenerateRequest(BaseModel):
    username: str
    email: str
    wakeUpTime: str
    sleepPreference: str
    focusPreference: str
    shortTermGoals: str
    longTermGoals: str
    fixedCommitments: List[FixedCommitment] = Field(default_factory=list)
