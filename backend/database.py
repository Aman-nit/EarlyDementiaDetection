import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from .models.database import Base

# Use SQLite for local development (no installation required)
DATABASE_URL = "postgresql://neondb_owner:npg_Is7mbnlBcDV1@ep-rough-credit-aqq5pjki.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize the database by creating all tables defined in the models.
    """
    Base.metadata.create_all(bind=engine)
