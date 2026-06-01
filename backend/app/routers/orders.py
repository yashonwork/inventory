from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.create_order(db, order)


@router.get("/", response_model=List[schemas.OrderResponse])
def list_orders(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_orders(db)


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_order(db, order_id)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.delete_order(db, order_id)
