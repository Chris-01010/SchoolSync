import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Fallback to SQLite for local development if PostgreSQL is not available
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./schoolsync.db")

# SQLite needs different arguments
if DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(DATABASE_URL, echo=True)
else:
    engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
