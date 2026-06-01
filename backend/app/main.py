import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import init_db, get_db
from .routers import products, customers, orders, auth
from . import crud
from .auth import get_current_user, hash_password
from .models import User


def seed_defaults():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username=os.getenv("ADMIN_USERNAME", "admin"),
                email=os.getenv("ADMIN_EMAIL", "admin@inventory.local"),
                full_name="Administrator",
                password_hash=hash_password(os.getenv("ADMIN_PASSWORD", "admin")),
            )
            db.add(admin)
            db.commit()
            print("Default admin user created")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_defaults()
    yield


app = FastAPI(title="Inventory Management System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/")
def root():
    return {"message": "Inventory Management System API"}


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_dashboard_summary(db)
