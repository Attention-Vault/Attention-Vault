from datetime import datetime
from typing import Dict, List, Optional, Union

from pydantic import BaseModel, Field


class MetricsRequest(BaseModel):
    """Schema for tweet metrics verification request."""

    tweet_ids: List[str] = Field(..., description="List of tweet IDs to analyze")
    username: Optional[str] = Field(None, description="Twitter username for the tweets")
    start_date: Optional[str] = Field(
        None, description="Start date for metrics analysis (YYYY-MM-DD)"
    )
    end_date: Optional[str] = Field(
        None, description="End date for metrics analysis (YYYY-MM-DD)"
    )


class TweetMetrics(BaseModel):
    """Schema for tweet performance metrics."""

    tweet_id: str
    text: str
    created_at: datetime
    impression_count: Optional[int] = 0
    like_count: Optional[int] = 0
    retweet_count: Optional[int] = 0
    reply_count: Optional[int] = 0
    quote_count: Optional[int] = 0
    url: str


class MetricsResponse(BaseModel):
    """Schema for tweet metrics verification response."""

    success: bool
    message: str
    metrics: List[TweetMetrics] = []
    total_metrics: Dict[str, int] = Field(
        default_factory=lambda: {
            "impressions": 0,
            "likes": 0,
            "retweets": 0,
            "replies": 0,
            "quotes": 0,
        }
    )
