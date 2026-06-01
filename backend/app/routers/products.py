from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=schemas.ProductResponse, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.create_product(db, product)


@router.get("/", response_model=List[schemas.ProductResponse])
def list_products(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_products(db)


@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_product(db, product_id)


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    return crud.update_product(db, product_id, product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.delete_product(db, product_id)
