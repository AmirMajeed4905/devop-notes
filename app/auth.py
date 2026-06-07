from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app import models, schemas
from app.database import get_db
from app.security import authenticate_user, create_access_token, get_password_hash, get_user_by_email

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/register', response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post('/login', response_model=schemas.Token)
def login(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    access_token = create_access_token({'sub': user.email})
    return {'access_token': access_token, 'token_type': 'bearer'}
