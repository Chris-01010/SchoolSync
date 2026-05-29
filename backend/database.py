import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Load .env from project root — works regardless of where uvicorn is launched from
_root = Path(__file__).resolve().parent.parent   # backend/ -> project root
load_dotenv(dotenv_path=_root / ".env", override=False)
# Also try backend/.env as fallback
load_dotenv(dotenv_path=_root / "backend" / ".env", override=False)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Add it to your .env file.")

is_postgres = DATABASE_URL.startswith("postgresql")
is_pooler = "pooler.supabase.com" in DATABASE_URL

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    # Required when using Supabase's Supavisor pooler with asyncpg
    connect_args={"statement_cache_size": 0} if is_pooler else {},
    **(
        dict(pool_recycle=300, pool_size=5, max_overflow=10)
        if is_postgres else {}
    ),
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session