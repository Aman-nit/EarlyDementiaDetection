from fastapi import FastAPI ,HTTPException , Query ,Path ,APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel,Field,computed_field
from typing import Annotated,Literal,Optional
import json
import uvicorn



app = FastAPI()

from pydantic import BaseModel, Field
from typing import List, Optional

class PatientInfo(BaseModel):
    name: str = Field(..., example="John Doe")
    age: int = Field(..., gt=0, example=70)
    gender: str = Field(..., example="Female") # "Male", "Female", "Other"
    education_level: str = Field(..., example="College") # "Elementary", "High School", "College", "Graduate"
    diabetes: bool = Field(False)
    hypertension: bool = Field(False)
    heart_disease: bool = Field(False)
    stroke_history: bool = Field(False)
    depression: bool = Field(False)
    sleep_disorders: bool = Field(False)
    family_history_dementia: bool = Field(False)
    current_medications: Optional[List[str]] = Field(default_factory=list, example=["metformin", "amlodipine"])



router = APIRouter()

# Simulate DB with an in-memory store
PATIENTS_DB = []

@router.post("/patient-info", response_model=PatientInfo)
def create_patient_info(data: PatientInfo):
    """
    Collect and store basic patient information
    """
    # Save to database (just append for now)
    PATIENTS_DB.append(data.dict())
    return data



if __name__ == "__main__":
    
    uvicorn.run("main:app", reload=True)
