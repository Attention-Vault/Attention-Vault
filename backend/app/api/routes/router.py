from fastapi import APIRouter
from app.api.routes import contracts

# Create main API router
api_router = APIRouter()

# Include contract routes
api_router.include_router(contracts.router, tags=["Contract Operations"])
