from fastapi import FastAPI 
from routes import patientInfo

app = FastAPI(
    title="Dementia Detection API",
    description="Backend API for Dementia Risk Assessment",
    version="1.0.0"
)

# Include your patient router
app.include_router(patientInfo.router, prefix="/api", tags=["PatientInfo"])

@app.get("/")
def home():
    return {"message": "Welcome to the Dementia Detection Backend!"}
