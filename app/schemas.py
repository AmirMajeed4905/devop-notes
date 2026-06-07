from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class NoteCreate(BaseModel):
    title: str
    content: str

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str

    class Config:
        from_attributes = True
