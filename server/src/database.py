from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.exc import OperationalError
from contextlib import asynccontextmanager
from . import db_models, env


engine = create_async_engine(env.SQLALCHEMY_DATABASE_URI)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(db_models.Base.metadata.create_all)
    except OperationalError:
        print("Error: Could not connect to the database")


# to be used by FastAPI Depends()
async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


# to be used outside FastAPI
@asynccontextmanager
async def db_session():
    async with AsyncSessionLocal() as db:
        yield db
