import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/mydb"
)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def init_db():
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    if 'notes' in inspector.get_table_names():
        note_columns = [column['name'] for column in inspector.get_columns('notes')]
        if 'owner_id' not in note_columns:
            with engine.begin() as conn:
                conn.execute(text('ALTER TABLE notes ADD COLUMN owner_id INTEGER'))
                conn.execute(text(
                    'ALTER TABLE notes ADD CONSTRAINT notes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id)'
                ))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
