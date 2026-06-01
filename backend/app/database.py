import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/inventory_db",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db(max_retries=5, delay=3):
    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            print("Database connected and tables created")
            return
        except Exception as e:
            print(f"Database connection attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
            else:
                print("Failed to connect to database after all retries")
                raise


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
