import os
from typing import Any
from loguru import logger

# Import solana.py and solders libraries
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solders.transaction import Transaction
# from solana.transaction import TransactionInstruction

# Solana testnet RPC URL
SOLANA_TESTNET_RPC = "https://api.testnet.sonic.game"

# Wallet secret for distributing tranches (in production, use secure storage)
WALLET_SECRET = os.getenv("SOLANA_WALLET_SECRET", "")


async def validate_contract_address(address: str, get_tranches: bool = False) -> Any:
    """
    Validate that a contract address exists on the Solana testnet.
    Optionally retrieves tranche information from the contract.

    Args:
        address: The Solana address to validate
        get_tranches: Whether to retrieve tranche information

    Returns:
        If get_tranches is True, returns contract data with tranches.
        Otherwise, returns True if the address is valid, False if not.
    """
    try:
        # Create Solana client
        client = AsyncClient(SOLANA_TESTNET_RPC)

        # Convert address string to PublicKey object
        public_key = Pubkey.from_string(address)

        # Get account info
        response = await client.get_account_info(public_key)

        # Check if account exists
        if not response.value:
            logger.info(f"Address {address} not found on the Solana testnet")
            await client.close()
            return False

        # If we're just validating existence, return True here
        if not get_tranches:
            await client.close()
            return True

        # For getting tranches, in a real implementation:
        # - Parse the account data according to the contract's data structure
        # - Or make RPC calls to extract tranche info

        # Mock tranche data for demonstration purposes
        # In a real application, you would:
        # 1. Parse the contract data from the account info
        # 2. Make RPC calls to the contract to get tranche information
        mock_tranches = {
            "tranches": [
                {"threshold": 100, "amount": "0.1 SOL"},
                {"threshold": 500, "amount": "0.25 SOL"},
                {"threshold": 1000, "amount": "0.5 SOL"},
                {"threshold": 10000, "amount": "1 SOL"},
            ]
        }

        await client.close()
        logger.info(f"Retrieved tranche information for contract {address}")
        return mock_tranches
    except Exception as e:
        logger.error(f"Error validating Solana address: {str(e)}")
        return False


async def distribute_tranche(contract_address: str, tranche_index: int) -> bool:
    """
    Distribute a specific tranche of a contract to the influencer.

    In production, this would call the Solana contract's
    distribute_tranche method.

    Args:
        contract_address: The contract address
        tranche_index: The index of the tranche to distribute

    Returns:
        bool: True if the distribution was successful, False otherwise
    """
    try:
        logger.info(
            f"Distributing tranche {tranche_index} for contract {contract_address}"
        )

        # Create Solana client
        client = AsyncClient(SOLANA_TESTNET_RPC)

        # In a real implementation:
        # 1. Load the wallet keypair from WALLET_SECRET
        if WALLET_SECRET:
            wallet_keypair = Keypair.from_base58_string(WALLET_SECRET)
        else:
            # For testing purposes only - not for production
            logger.warning(
                "Using dummy wallet keypair since WALLET_SECRET is not provided"
            )
            wallet_keypair = Keypair()

        # 2. Create program public key
        program_id = Pubkey.from_string(contract_address)

        # 3. Build transaction instruction
        # This is a simplified example - in reality, you would:
        # - Encode the instruction data properly based on contract's IDL
        # - Include the correct accounts based on the contract's requirements
        instruction_data = bytes([0]) + tranche_index.to_bytes(
            1, byteorder="little"
        )  # Example encoding

        # Create a transaction instruction
        # In a real implementation, specify the correct accounts array
        instruction = TransactionInstruction(
            program_id=program_id,
            data=instruction_data,
            keys=[],  # You would add the correct account metas here
        )

        # 4. Create, sign and send transaction
        transaction = Transaction().add(instruction)
        signature = await client.send_transaction(transaction, wallet_keypair)

        # 5. Confirm the transaction
        await client.confirm_transaction(signature.value)

        # Close the client connection
        await client.close()

        logger.info(
            f"Successfully distributed tranche {tranche_index} for "
            f"contract {contract_address}"
        )
        return True

    except Exception as e:
        logger.error(
            f"Error distributing tranche {tranche_index} for "
            f"contract {contract_address}: {str(e)}"
        )
        return False
