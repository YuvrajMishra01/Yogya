import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

import app.database
from app.main import app as fastapi_app
from app.database import Base, get_db
from app.models.user import User
from app.core.security import get_password_hash, create_access_token
import app.models  # Ensure all SQLAlchemy models are imported

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_temp.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Seamlessly bind app.database.AsyncSessionLocal to TestingSessionLocal during test runs
# so background worker tasks execute against test_engine cleanly without test code in worker.py
app.database.AsyncSessionLocal = TestingSessionLocal
app.database.engine = test_engine

async def override_get_db():
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

fastapi_app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()

@pytest_asyncio.fixture
async def client(setup_db):
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def test_officer(setup_db):
    async with TestingSessionLocal() as db:
        user = User(
            id="test-officer-1",
            email="test_officer@yogya.gov.in",
            hashed_password=get_password_hash("Officer@123"),
            full_name="Test Officer",
            role="officer",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

@pytest_asyncio.fixture
async def test_officer2(setup_db):
    async with TestingSessionLocal() as db:
        user = User(
            id="test-officer-2",
            email="test_officer2@yogya.gov.in",
            hashed_password=get_password_hash("Officer2@123"),
            full_name="Test Officer 2",
            role="officer",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

@pytest_asyncio.fixture
async def test_admin(setup_db):
    async with TestingSessionLocal() as db:
        user = User(
            id="test-admin-1",
            email="test_admin@yogya.gov.in",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Test Admin",
            role="admin",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

@pytest_asyncio.fixture
def officer_token(test_officer):
    return create_access_token(subject=test_officer.id, role=test_officer.role)

@pytest_asyncio.fixture
def officer2_token(test_officer2):
    return create_access_token(subject=test_officer2.id, role=test_officer2.role)

@pytest_asyncio.fixture
def admin_token(test_admin):
    return create_access_token(subject=test_admin.id, role=test_admin.role)
