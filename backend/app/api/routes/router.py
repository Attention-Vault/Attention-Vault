from fastapi import APIRouter

from app.api.routes import twitter

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(twitter.router, prefix="/verify/twitter", tags=["Twitter Verification"])