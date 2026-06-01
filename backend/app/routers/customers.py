from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/", response_model=schemas.CustomerResponse, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db, customer)


@router.get("/", response_model=List[schemas.CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    return crud.get_customers(db)


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return crud.get_customer(db, customer_id)


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    return crud.delete_customer(db, customer_id)
