import tweepy
from typing import Dict, List, Optional, Union
from datetime import datetime, date

from app.core.config import settings
from app.schemas.twitter import TweetMetrics


class TwitterService:
    """Service for interacting with the Twitter API."""

    def __init__(self):
        """Initialize the Twitter API client."""
        self.client = tweepy.Client(
            bearer_token=settings.TWITTER_BEARER_TOKEN,
            consumer_key=settings.TWITTER_API_KEY,
            consumer_secret=settings.TWITTER_API_SECRET,
            access_token=settings.TWITTER_ACCESS_TOKEN,
            access_token_secret=settings.TWITTER_ACCESS_SECRET
        )

    def get_tweet_metrics(self, tweet_ids: List[str]) -> List[TweetMetrics]:
        """
        Get performance metrics for the specified tweets.

        Args:
            tweet_ids: List of tweet IDs to analyze

        Returns:
            List of tweet metrics
        """
        metrics = []

        try:
            # Fetch tweets with public metrics
            tweets = self.client.get_tweets(
                tweet_ids,
                tweet_fields=[
                    "created_at", "public_metrics", "text"
                ],
                expansions=["author_id"]
            )

            if not tweets.data:
                return []

            # Process each tweet
            for tweet in tweets.data:
                metrics.append(
                    TweetMetrics(
                        tweet_id=tweet.id,
                        text=tweet.text,
                        created_at=tweet.created_at,
                        impression_count=getattr(tweet.public_metrics, "impression_count", 0),
                        like_count=getattr(tweet.public_metrics, "like_count", 0),
                        retweet_count=getattr(tweet.public_metrics, "retweet_count", 0),
                        reply_count=getattr(tweet.public_metrics, "reply_count", 0),
                        quote_count=getattr(tweet.public_metrics, "quote_count", 0),
                        url=f"https://twitter.com/user/status/{tweet.id}"
                    )
                )

            return metrics

        except tweepy.TweepyException as e:
            print(f"Twitter API error: {str(e)}")
            return []

    def calculate_total_metrics(self, metrics: List[TweetMetrics]) -> Dict[str, int]:
        """
        Calculate total metrics across all tweets.

        Args:
            metrics: List of tweet metrics

        Returns:
            Dictionary of total metrics
        """
        totals = {
            "impressions": 0,
            "likes": 0,
            "retweets": 0,
            "replies": 0,
            "quotes": 0
        }

        for metric in metrics:
            totals["impressions"] += metric.impression_count
            totals["likes"] += metric.like_count
            totals["retweets"] += metric.retweet_count
            totals["replies"] += metric.reply_count
            totals["quotes"] += metric.quote_count

        return totals