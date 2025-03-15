import pytest
import asyncio
from datetime import datetime
from typing import Dict, Any

# Import the functions we want to test
from app.services.db_service import store_contract_data, get_contract, update_contract_with_post

# Import MongoDB client and db for patching
import app.services.db_service as db_service

pytestmark = pytest.mark.asyncio

class TestDbService:
    """Tests for the database service functions."""

    async def test_store_contract_data_success(self, monkeypatch, test_db, sample_contract_data):
        """Test storing contract data successfully."""
        # Patch the db reference to use our test database
        monkeypatch.setattr(db_service, "db", test_db)

        # Call the function
        result = await store_contract_data(sample_contract_data)

        # Verify results
        assert result is True

        # Verify the data was stored correctly
        stored_contract = await test_db.contracts.find_one({"contract_address": sample_contract_data["contract_address"]})
        assert stored_contract is not None
        assert stored_contract["contract_address"] == sample_contract_data["contract_address"]
        assert stored_contract["verification_text"] == sample_contract_data["verification_text"]
        assert stored_contract["twitter_handle"] == sample_contract_data["twitter_handle"]
        assert "created_at" in stored_contract
        assert stored_contract["status"] == "pending"

    async def test_store_contract_data_failure(self, monkeypatch):
        """Test storing contract data with an exception."""
        # Mock the insert_one method to raise an exception
        async def mock_insert_one(*args, **kwargs):
            raise Exception("Database error")

        # Create a mock collection
        class MockCollection:
            insert_one = mock_insert_one

        # Create a mock db
        class MockDb:
            contracts = MockCollection()

        # Patch the db
        monkeypatch.setattr(db_service, "db", MockDb())

        # Call the function
        result = await store_contract_data({"contract_address": "test"})

        # Verify the function returned False due to the exception
        assert result is False

    async def test_get_contract_success(self, monkeypatch, test_db, sample_contract_data):
        """Test retrieving a contract successfully."""
        # Patch the db reference to use our test database
        monkeypatch.setattr(db_service, "db", test_db)

        # Insert a sample contract first
        sample_contract_data["created_at"] = datetime.utcnow()
        sample_contract_data["status"] = "pending"
        await test_db.contracts.insert_one(sample_contract_data)

        # Call the function
        result = await get_contract(sample_contract_data["contract_address"])

        # Verify results
        assert result is not None
        assert result["contract_address"] == sample_contract_data["contract_address"]
        assert result["verification_text"] == sample_contract_data["verification_text"]
        assert result["twitter_handle"] == sample_contract_data["twitter_handle"]

    async def test_get_contract_not_found(self, monkeypatch, test_db):
        """Test retrieving a non-existent contract."""
        # Patch the db reference to use our test database
        monkeypatch.setattr(db_service, "db", test_db)

        # Call the function with a non-existent contract address
        result = await get_contract("non_existent_contract")

        # Verify the result is None
        assert result is None

    async def test_get_contract_error(self, monkeypatch):
        """Test get_contract with a database error."""
        # Mock the find_one method to raise an exception
        async def mock_find_one(*args, **kwargs):
            raise Exception("Database error")

        # Create a mock collection
        class MockCollection:
            find_one = mock_find_one

        # Create a mock db
        class MockDb:
            contracts = MockCollection()

        # Patch the db
        monkeypatch.setattr(db_service, "db", MockDb())

        # Call the function
        result = await get_contract("test_contract")

        # Verify the function returned None due to the exception
        assert result is None

    async def test_update_contract_with_post_success(self, monkeypatch, test_db, sample_contract_data, sample_update_data):
        """Test updating a contract with post data successfully."""
        # Patch the db reference to use our test database
        monkeypatch.setattr(db_service, "db", test_db)

        # Insert a sample contract first
        sample_contract_data["created_at"] = datetime.utcnow()
        sample_contract_data["status"] = "pending"
        await test_db.contracts.insert_one(sample_contract_data)

        # Call the function to update the contract
        result = await update_contract_with_post(
            sample_contract_data["contract_address"],
            sample_update_data
        )

        # Verify results
        assert result is True

        # Verify the data was updated correctly
        updated_contract = await test_db.contracts.find_one({
            "contract_address": sample_contract_data["contract_address"]
        })

        assert updated_contract is not None
        assert updated_contract["post_url"] == sample_update_data["post_url"]
        assert updated_contract["status"] == "claimed"
        assert updated_contract["tranches_distributed"] == 2
        assert updated_contract["metrics"]["like_count"] == 500

    async def test_update_contract_with_post_not_found(self, monkeypatch, test_db, sample_update_data):
        """Test updating a non-existent contract."""
        # Patch the db reference to use our test database
        monkeypatch.setattr(db_service, "db", test_db)

        # Call the function with a non-existent contract address
        result = await update_contract_with_post("non_existent_contract", sample_update_data)

        # Verify the result is False since no document was updated
        assert result is False

    async def test_update_contract_with_post_error(self, monkeypatch, sample_update_data):
        """Test update_contract_with_post with a database error."""
        # Mock the update_one method to raise an exception
        async def mock_update_one(*args, **kwargs):
            raise Exception("Database error")

        # Create a mock collection
        class MockCollection:
            update_one = mock_update_one

        # Create a mock db
        class MockDb:
            contracts = MockCollection()

        # Patch the db
        monkeypatch.setattr(db_service, "db", MockDb())

        # Call the function
        result = await update_contract_with_post("test_contract", sample_update_data)

        # Verify the function returned False due to the exception
        assert result is False