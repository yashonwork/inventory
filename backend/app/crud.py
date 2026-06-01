from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from . import models, schemas


def create_product(db: Session, product: schemas.ProductCreate):
    existing = db.query(models.Product).filter(
        models.Product.sku == product.sku
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this SKU already exists",
        )
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session):
    return db.query(models.Product).all()


def get_product(db: Session, product_id: int):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    update_data = product.model_dump(exclude_unset=True)
    if "sku" in update_data:
        existing = db.query(models.Product).filter(
            models.Product.sku == update_data["sku"],
            models.Product.id != product_id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists",
            )
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}


def create_customer(db: Session, customer: schemas.CustomerCreate):
    existing = db.query(models.Customer).filter(
        models.Customer.email == customer.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this email already exists",
        )
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customers(db: Session):
    return db.query(models.Customer).all()


def get_customer(db: Session, customer_id: int):
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    return customer


def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}


def create_order(db: Session, order: schemas.OrderCreate):
    customer = get_customer(db, order.customer_id)

    total_amount = 0.0
    db_order_items = []

    for item in order.items:
        product = get_product(db, item.product_id)
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. "
                       f"Available: {product.quantity}, requested: {item.quantity}",
            )
        unit_price = product.price
        total_amount += unit_price * item.quantity
        product.quantity -= item.quantity

        db_order_items.append(
            models.OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
        )

    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        items=db_order_items,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def get_orders(db: Session):
    return db.query(models.Order).all()


def get_order(db: Session, order_id: int):
    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order


def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    for item in db_order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        if product:
            product.quantity += item.quantity
    db.delete(db_order)
    db.commit()
    return {"message": "Order cancelled successfully"}


def get_dashboard_summary(db: Session):
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.id)).scalar() or 0
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    low_stock_products = db.query(models.Product).filter(
        models.Product.quantity < 5
    ).count()
    return schemas.DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
    )
