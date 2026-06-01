import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..auth import (
    LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest,
    TokenResponse, MessageResponse,
    hash_password, verify_password, create_access_token, _reset_tokens,
)

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": body.username}, remember_me=body.remember_me)
    return TokenResponse(access_token=token)


@router.post("/auth/register", response_model=MessageResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == body.username) | (User.email == body.email)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already exists")
    user = User(
        username=body.username,
        email=body.email,
        full_name=body.full_name,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    return MessageResponse(message="Account created successfully")


@router.post("/auth/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        return MessageResponse(message="If that email exists, a reset link has been sent")
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = {
        "user_id": user.id,
        "expires": datetime.now(timezone.utc).timestamp() + 3600,
    }
    print(f"Password reset token for {body.email}: {token}")
    return MessageResponse(message="If that email exists, a reset link has been sent")


@router.post("/auth/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    data = _reset_tokens.get(body.token)
    if not data or datetime.now(timezone.utc).timestamp() > data["expires"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    del _reset_tokens[body.token]
    return MessageResponse(message="Password reset successfully")
