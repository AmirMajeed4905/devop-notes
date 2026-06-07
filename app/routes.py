from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db, engine, Base
from app.models import Note
from app.schemas import NoteCreate, NoteResponse
from app.security import get_current_user

router = APIRouter(prefix='/notes', tags=['notes'])

# create tables
Base.metadata.create_all(bind=engine)


@router.post('', response_model=NoteResponse)
def create_note(note: NoteCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    new_note = Note(title=note.title, content=note.content, owner_id=current_user.id)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


@router.get('', response_model=list[NoteResponse])
def get_notes(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.owner_id == current_user.id).all()


@router.delete('/{note_id}')
def delete_note(note_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Note not found')
    db.delete(note)
    db.commit()
    return {'message': 'Note deleted'}


@router.put('/{note_id}', response_model=NoteResponse)
def update_note(note_id: int, updated: NoteCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id, Note.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Note not found')
    note.title = updated.title
    note.content = updated.content
    db.commit()
    db.refresh(note)
    return note