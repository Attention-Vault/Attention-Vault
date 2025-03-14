from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.twitter import MetricsRequest, MetricsResponse
from app.services.twitter_service import TwitterService

# Create Twitter router
router = APIRouter()


def get_twitter_service():
    """Dependency to get the Twitter service."""
    return TwitterService()


@router.post("/metrics", response_model=MetricsResponse)
async def verify_tweet_metrics(
    request: MetricsRequest,
    twitter_service: TwitterService = Depends(get_twitter_service)
):
    """
    Verify tweet performance metrics (impressions, engagement, etc.)

    This endpoint retrieves performance metrics for the specified tweets
    and calculates total engagement metrics across all tweets.
    """
    # Check if we have tweet IDs to analyze
    if not request.tweet_ids:
        return MetricsResponse(
            success=False,
            message="No tweet IDs provided"
        )

    try:
        # Get metrics for each tweet
        metrics = twitter_service.get_tweet_metrics(request.tweet_ids)

        if not metrics:
            return MetricsResponse(
                success=False,
                message="No metrics found for the provided tweet IDs"
            )

        # Calculate total metrics across all tweets
        total_metrics = twitter_service.calculate_total_metrics(metrics)

        return MetricsResponse(
            success=True,
            message=f"Successfully retrieved metrics for {len(metrics)} tweets",
            metrics=metrics,
            total_metrics=total_metrics
        )

    except Exception as e:
        # Log the error (in a production app, use a proper logger)
        print(f"Error verifying tweet metrics: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify tweet metrics: {str(e)}"
        )