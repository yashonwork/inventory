from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from .routers import products, customers, orders
from . import crud

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/")
def root():
    return {"message": "Inventory Management System API"}


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_summary(db)
