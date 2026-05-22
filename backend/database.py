import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Load .env from project root (works regardless of where you run from)
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./schoolsync.db")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session