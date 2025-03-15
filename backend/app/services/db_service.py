import motor.motor_asyncio
from typing import Dict, Any, Optional
from loguru import logger
import os
from datetime import datetime

# MongoDB connection string - in production, use environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "attention_vault")

# Create a connection to MongoDB
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def store_contract_data(contract_data: Dict[str, Any]) -> bool:
    """
    Store contract data in MongoDB.

    Args:
        contract_data: Dictionary containing contract details

    Returns:
        bool: True if storage was successful, False otherwise
    """
    try:
        # Add timestamp for when the contract was created
        contract_data["created_at"] = datetime.utcnow()

        # Define initial contract state
        contract_data["status"] = "pending"  # pending, active, completed, etc.

        # Insert contract data into the contracts collection
        result = await db.contracts.insert_one(contract_data)

        # Check if insertion was successful
        if result.inserted_id:
            logger.info(f"Contract stored successfully with ID: {result.inserted_id}")
            return True
        else:
            logger.error("Failed to store contract data")
            return False

    except Exception as e:
        logger.error(f"Database error while storing contract: {str(e)}")
        return False

async def get_contract(contract_address: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve contract data from MongoDB.

    Args:
        contract_address: The Solana contract address

    Returns:
        Dictionary containing contract details or None if not found
    """
    try:
        contract = await db.contracts.find_one({"contract_address": contract_address})
        return contract

    except Exception as e:
        logger.error(f"Database error while retrieving contract: {str(e)}")
        return None

async def update_contract_with_post(
    contract_address: str, 
    update_data: Dict[str, Any]
) -> bool:
    """
    Update a contract with post data after a successful claim.

    Args:
        contract_address: The contract address to update
        update_data: The data to update (post URL, metrics, etc.)

    Returns:
        bool: True if update was successful, False otherwise
    """
    try:
        # Update the contract with the provided data
        result = await db.contracts.update_one(
            {"contract_address": contract_address},
            {"$set": update_data}
        )

        # Check if update was successful
        if result.modified_count > 0:
            logger.info(f"Contract {contract_address} updated with post data")
            return True
        else:
            logger.warning(f"No contract was updated for {contract_address}")
            return False

    except Exception as e:
        logger.error(f"Database error while updating contract with post: {str(e)}")
        return False