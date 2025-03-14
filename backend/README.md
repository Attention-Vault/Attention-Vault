# Attention Vault Backend

This backend API serves as the verification layer for the Attention Vault platform, connecting social media metrics with blockchain-based payment contracts.

## Features

- Twitter metrics verification endpoint (`/api/verify/twitter/metrics`)
- Integration with Twitter API for performance metrics

## Setup Instructions

### Prerequisites

- Python 3.11+
- Twitter Developer Account with API credentials

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd Attention-Vault/backend
   ```
3. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```
   pip install -e .
   ```
5. Configure environment variables by editing the `.env` file:
   ```
   # Twitter API Credentials
   TWITTER_API_KEY=your_api_key_here
   TWITTER_API_SECRET=your_api_secret_here
   TWITTER_ACCESS_TOKEN=your_access_token_here
   TWITTER_ACCESS_SECRET=your_access_secret_here
   TWITTER_BEARER_TOKEN=your_bearer_token_here
   ```

## Running the API

Start the backend API server:

```
python main.py
```

The API server will be available at http://localhost:8000

## API Documentation

FastAPI automatically generates interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Verify Tweet Metrics

**Endpoint:** `POST /api/verify/twitter/metrics`

Verifies tweet performance metrics like impressions, likes, retweets, etc.

**Request Body:**
```json
{
  "tweet_ids": ["1234567890123456789", "9876543210987654321"],
  "username": "example_user",  // Optional
  "start_date": "2023-01-01",  // Optional
  "end_date": "2023-01-31"     // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully retrieved metrics for 2 tweets",
  "metrics": [
    {
      "tweet_id": "1234567890123456789",
      "text": "Example tweet content",
      "created_at": "2023-01-15T12:34:56Z",
      "impression_count": 5000,
      "like_count": 250,
      "retweet_count": 50,
      "reply_count": 15,
      "quote_count": 5,
      "url": "https://twitter.com/user/status/1234567890123456789"
    },
    // Additional tweets...
  ],
  "total_metrics": {
    "impressions": 10000,
    "likes": 500,
    "retweets": 100,
    "replies": 30,
    "quotes": 10
  }
}
```