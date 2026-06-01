from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductResponse(ProductBase):
    id: int

    model_config = {"from_attributes": True}


class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int

    model_config = {"from_attributes": True}


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductResponse] = None

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemBase]


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    created_at: datetime
    total_amount: float
    customer: Optional[CustomerResponse] = None
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
