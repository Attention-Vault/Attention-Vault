import httpx
import asyncio
from loguru import logger

# Solana testnet RPC URL
SOLANA_TESTNET_RPC = "https://api.testnet.solana.com"

async def validate_contract_address(address: str) -> bool:
    """
    Validate that a contract address exists on the Solana testnet.

    Args:
        address: The Solana address to validate

    Returns:
        bool: True if the address is valid and exists, False otherwise
    """
    try:
        # Create JSON-RPC request payload to get account info
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAccountInfo",
            "params": [
                address,
                {
                    "encoding": "base64"
                }
            ]
        }

        # Make the RPC call to Solana testnet
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(SOLANA_TESTNET_RPC, json=payload)

            # Parse the response
            result = response.json()

            # Check if the response contains an account (indicating it exists)
            if "result" in result and result["result"] is not None:
                return True
            logger.info(f"Address {address} is not found on the Solana testnet")
            return False

    except Exception as e:
        logger.error(f"Error validating Solana address: {str(e)}")
        return False