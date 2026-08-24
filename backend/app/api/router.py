from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.inspections import router as inspections_router
from app.api.products import router as products_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(inspections_router)
api_router.include_router(products_router)
api_router.include_router(dashboard_router)
