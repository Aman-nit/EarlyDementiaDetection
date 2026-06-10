from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    education_level = Column(String)

    # Clinical/Comorbid
    hypertension = Column(Boolean, default=False)
    heart_disease = Column(Boolean, default=False)
    diabetes = Column(Boolean, default=False)
    family_history_apoe = Column(Boolean, default=False)

    # Lifestyle
    sleep_quality = Column(Integer)  # 1-10
    physical_activity = Column(String)
    dietary_habits = Column(String)
    substance_use = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mri_analyses = relationship("MRIAnalysis", back_populates="patient")
    cognitive_results = relationship("CognitiveResults", back_populates="patient")

class MRIAnalysis(Base):
    __tablename__ = "mri_analyses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    image_path = Column(String, nullable=False)
    predicted_class = Column(Integer)  # 0: No Impairment, 1: Very Mild, 2: Mild, 3: Moderate
    confidence = Column(Float)
    analysis_date = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="mri_analyses")

class CognitiveResults(Base):
    __tablename__ = "cognitive_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    game_name = Column(String, nullable=False)
    score = Column(Float)
    completion_time = Column(Float)
    error_count = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="cognitive_results")
