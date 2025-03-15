import pytest
import asyncio
import motor.motor_asyncio
from datetime import datetime
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

# Test MongoDB connection settings
TEST_MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
TEST_DB_NAME = "attention_vault_test"


@pytest.fixture(scope="function")
def event_loop():
    """
    Create an instance of the default event loop for each test case.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db():
    """
    Create a test database connection and clean up after the test.
    """
    # Connect to test database
    client = motor.motor_asyncio.AsyncIOMotorClient(TEST_MONGO_URI)
    db = client[TEST_DB_NAME]

    # Clear the database before the test runs
    await db.contracts.delete_many({})

    yield db

    # Clean up after the test
    await db.contracts.delete_many({})
    client.close()


@pytest.fixture(scope="function")
async def sample_contract_data():
    """
    Create sample contract data for testing.
    """
    return {
        "contract_address": "test_contract_address_123",
        "verification_text": "This is a test verification text for Attention Vault",
        "twitter_handle": "test_twitter_handle",
    }


@pytest.fixture(scope="function")
async def sample_update_data():
    """
    Create sample update data for testing contract updates.
    """
    return {
        "post_url": "https://twitter.com/test_twitter_handle/status/123456789",
        "metrics": {
            "like_count": 500,
            "retweet_count": 100,
            "reply_count": 50,
            "quote_count": 25,
            "impression_count": 10000,
            "retrieved_at": datetime.utcnow().isoformat(),
        },
        "status": "claimed",
        "tranches_distributed": 2,
        "claimed_at": datetime.utcnow().isoformat(),
    }
