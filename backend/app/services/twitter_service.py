import tweepy
import re
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, date
from app.core.config import settings
from app.schemas.twitter import TweetMetrics
from loguru import logger
import asyncio
import time


class TwitterService:
    """Service for interacting with the Twitter API."""

    def __init__(self):
        """Initialize the Twitter API client."""
        self.client = tweepy.Client(
            bearer_token=settings.TWITTER_BEARER_TOKEN,
            consumer_key=settings.TWITTER_API_KEY,
            consumer_secret=settings.TWITTER_API_SECRET,
            access_token=settings.TWITTER_ACCESS_TOKEN,
            access_token_secret=settings.TWITTER_ACCESS_SECRET,
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
                tweet_fields=["created_at", "public_metrics", "text"],
                expansions=["author_id"],
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
                        impression_count=getattr(
                            tweet.public_metrics, "impression_count", 0
                        ),
                        like_count=getattr(tweet.public_metrics, "like_count", 0),
                        retweet_count=getattr(tweet.public_metrics, "retweet_count", 0),
                        reply_count=getattr(tweet.public_metrics, "reply_count", 0),
                        quote_count=getattr(tweet.public_metrics, "quote_count", 0),
                        url=f"https://twitter.com/user/status/{tweet.id}",
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
            "quotes": 0,
        }

        for metric in metrics:
            totals["impressions"] += metric.impression_count
            totals["likes"] += metric.like_count
            totals["retweets"] += metric.retweet_count
            totals["replies"] += metric.reply_count
            totals["quotes"] += metric.quote_count

        return totals

    def validate_handle(self, twitter_handle: str) -> bool:
        """
        Validate that a Twitter handle exists.

        Args:
            twitter_handle: The Twitter username to validate (with or without @)

        Returns:
            bool: True if the handle exists, False otherwise
        """
        try:
            # Remove @ if present
            handle = twitter_handle.strip("@").strip()

            # Query the Twitter API to check if the user exists
            user = self.client.get_user(username=handle)
            return user is not None

        except tweepy.TweepyException as e:
            logger.error(f"Error validating Twitter handle {twitter_handle}: {str(e)}")
            return False

    def extract_tweet_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract tweet ID from various forms of Twitter/X URLs.

        Args:
            url: Twitter post URL

        Returns:
            str: Tweet ID if found, None otherwise
        """
        # Match patterns like https://twitter.com/username/status/1234567890
        # or https://x.com/username/status/1234567890
        twitter_patterns = [
            r"twitter\.com/\w+/status/(\d+)",
            r"x\.com/\w+/status/(\d+)",
        ]

        for pattern in twitter_patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        return None

    def validate_post_url(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Validate a Twitter post URL and extract information from it.

        Args:
            url: Twitter post URL

        Returns:
            Dict containing post information or None if invalid
        """
        try:
            # Extract tweet ID from URL
            tweet_id = self.extract_tweet_id_from_url(url)
            if not tweet_id:
                logger.error(f"Invalid Twitter URL format: {url}")
                return None

            # Fetch tweet data
            tweet = self.client.get_tweet(
                tweet_id,
                tweet_fields=["created_at", "public_metrics", "text"],
                expansions=["author_id"],
            )

            if not tweet.data:
                logger.error(f"Tweet not found: {url}")
                return None

            # Get author data
            if tweet.includes and "users" in tweet.includes:
                author = tweet.includes["users"][0]
                author_handle = author.username
            else:
                # Fallback - get user from the tweet's author_id
                author = self.client.get_user(id=tweet.data.author_id).data
                author_handle = author.username if author else None

            if not author_handle:
                logger.error(f"Could not determine author of tweet: {url}")
                return None

            # Return tweet info
            return {
                "tweet_id": tweet_id,
                "author_id": tweet.data.author_id,
                "author_handle": author_handle,
                "text": tweet.data.text,
                "created_at": tweet.data.created_at,
                "public_metrics": (
                    tweet.data.public_metrics._json
                    if hasattr(tweet.data.public_metrics, "_json")
                    else tweet.data.public_metrics
                ),
            }

        except tweepy.TweepyException as e:
            logger.error(f"Error validating Twitter URL {url}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"General error validating Twitter URL {url}: {str(e)}")
            return None

    async def get_post_metrics(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Get metrics for a specific Twitter post.

        Args:
            url: Twitter post URL

        Returns:
            Dict containing post metrics or None if failed
        """
        try:
            # Extract tweet ID and validate URL
            post_info = await self.validate_post_url(url)
            if not post_info:
                return None

            # Extract the metrics
            metrics = post_info.get("public_metrics", {})

            # Return formatted metrics
            return {
                "like_count": metrics.get("like_count", 0),
                "retweet_count": metrics.get("retweet_count", 0),
                "reply_count": metrics.get("reply_count", 0),
                "quote_count": metrics.get("quote_count", 0),
                "impression_count": metrics.get("impression_count", 0),
                "retrieved_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error getting metrics for Twitter URL {url}: {str(e)}")
            return None


# Create a singleton instance of the TwitterService
twitter_service = TwitterService()


# Create helper functions to use the singleton
def validate_twitter_handle(twitter_handle: str) -> bool:
    """
    Wrapper for validating Twitter handles.

    Args:
        twitter_handle: The Twitter handle to validate

    Returns:
        bool: True if the handle exists, False otherwise
    """
    return twitter_service.validate_handle(twitter_handle)


async def validate_post_url(url: str) -> Optional[Dict[str, Any]]:
    """
    Validate a Twitter post URL and extract information from it.

    Args:
        url: Twitter post URL

    Returns:
        Dict containing post information or None if invalid
    """
    post_info = twitter_service.validate_post_url(str(url))
    time.sleep(1)
    return post_info


async def get_post_metrics(url: str) -> Optional[Dict[str, Any]]:
    """
    Get metrics for a specific Twitter post.

    Args:
        url: Twitter post URL

    Returns:
        Dict containing post metrics or None if failed
    """
    return await twitter_service.get_post_metrics(url)
