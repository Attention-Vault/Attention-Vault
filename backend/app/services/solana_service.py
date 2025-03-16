import os
import json
from typing import Any, Dict, Optional
from loguru import logger
from construct import Struct, Int64ul, Int32ul, Bytes, Array, Container
from base58 import b58encode
from pathlib import Path
import requests
from solders.pubkey import Pubkey as PublicKey

import base64

# Import solana.py and solders libraries
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solders.transaction import Transaction
from solders.system_program import ID as SYS_PROGRAM_ID
from anchorpy import Idl, Program

# from solana.transaction import AccountMeta, TransactionInstruction
from solana.rpc.commitment import Confirmed

# Solana testnet RPC URL
SOLANA_TESTNET_RPC = "https://api.testnet.sonic.game"

# Wallet secret for distributing tranches (in production, use secure storage)
WALLET_SECRET = os.getenv("SOLANA_WALLET_SECRET", "")

# Path to the IDL file
IDL_PATH = (
    Path(__file__).parents[2]
    / "frontend.json"
)


def load_idl() -> Dict:
    """Load and parse the IDL file."""
    try:
        with open(IDL_PATH) as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading IDL file: {str(e)}")
        raise


def get_program_id() -> Pubkey:
    """Get program ID from IDL."""
    idl = load_idl()
    return Pubkey.from_string(idl["address"])


def get_program_handle() -> Program:
    """Get the program handle from the IDL."""
    idl = load_idl()
    idl = Idl.from_json(idl)
    program_id = get_program_id()
    return Program(idl, program_id)


# Load constants from IDL
PROGRAM_ID = get_program_id()


async def validate_contract_address(address: str, get_tranches: bool = False) -> Any:
    """
    Validate that a contract address exists on the Solana testnet.
    Optionally retrieves tranche information from the contract using proper Solana deserialization.

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

        # Call the function to parse contract data if needed
        if get_tranches:
            contract_data = get_payment_info(address)
            await client.close()
            return contract_data

        await client.close()
        return True
    except Exception as e:
        logger.error(f"Error validating Solana address: {str(e)}")
        return False


def get_payment_info(account_pubkey: str) -> Optional[Dict]:
    """
    Get contract data using raw REST commands to Solana RPC.

    This function directly interacts with the Solana RPC without relying on anchorpy,
    manually parsing the account data according to the PaymentContract structure.

    Args:
        account_pubkey (str): The public key of the contract account

    Returns:
        Optional[Dict]: The parsed contract data or None if an error occurred
    """
    try:
        # Solana RPC request payload for getAccountInfo
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAccountInfo",
            "params": [account_pubkey, {"encoding": "base64"}],
        }

        # Make RPC request
        response = requests.post(SOLANA_TESTNET_RPC, json=payload)
        if response.status_code != 200:
            logger.error(f"RPC request failed with status code: {response.status_code}")
            return None

        result = response.json()
        if "error" in result:
            logger.error(f"RPC error: {result['error']}")
            return None

        if not result.get("result", {}).get("value"):
            logger.error("Account not found")
            return None

        # Get the base64-encoded account data
        account_data_b64 = result["result"]["value"]["data"][0]
        account_data = base64.b64decode(account_data_b64)

        # Account data structure for PaymentContract:
        # 1. Discriminator (8 bytes) - [151, 55, 24, 165, 12, 206, 38, 31]
        # 2. Owner (32 bytes) - Pubkey
        # 3. Total amount (8 bytes) - u64
        # 4. Tranche count (8 bytes) - u64
        # 5. Recipients vector (4 bytes for length + n*32 bytes for pubkeys)
        # 6. Paid tranches (8 bytes) - u64

        # Skip 8-byte discriminator
        offset = 8

        # Extract owner pubkey (32 bytes)
        owner_bytes = account_data[offset : offset + 32]
        owner = str(PublicKey(owner_bytes))
        offset += 32

        # Extract total_amount (u64/8 bytes)
        total_amount = int.from_bytes(
            account_data[offset : offset + 8], byteorder="little"
        )
        offset += 8

        # Extract tranche_count (u64/8 bytes)
        tranche_count = int.from_bytes(
            account_data[offset : offset + 8], byteorder="little"
        )
        offset += 8

        # Extract recipients vector
        # First 4 bytes indicate vector length
        recipients_len = int.from_bytes(
            account_data[offset : offset + 4], byteorder="little"
        )
        offset += 4

        recipients = []
        for _ in range(recipients_len):
            recipient_bytes = account_data[offset : offset + 32]
            recipient = str(PublicKey(recipient_bytes))
            recipients.append(recipient)
            offset += 32

        # Extract paid_tranches (u64/8 bytes)
        paid_tranches = int.from_bytes(
            account_data[offset : offset + 8], byteorder="little"
        )

        # Construct and return the parsed data
        contract_data = {
            "owner": owner,
            "total_amount": total_amount,
            "tranche_count": tranche_count,
            "recipients": recipients,
            "paid_tranches": paid_tranches,
        }

        logger.info(
            f"Contract data retrieved using raw RPC: {json.dumps(contract_data, indent=2)}"
        )
        return contract_data

    except Exception as e:
        logger.error(f"Error in get_data_scratch: {str(e)}")
        return None


async def parse_contract_account_data(data: bytes) -> Optional[Dict]:
    """
    Parse contract account data from bytes into a structured dictionary.

    Args:
    data: Raw account data bytes

    Returns:
    Dictionary containing parsed contract data or None if invalid
    """
    return None  # use get_payment_info instead


"""
    try:
        program = get_program_handle()
        # TODO use the program to call the appropriate function to parse the contract data

        contract_data = {
            "owner": 'MikeXCd7jSsNMpeBXZp2s5hpNuFU994ojR1vGnCNQ7v',
            "total_amount": 100,
            "tranche_count": 10,
            "recipients": ['MikeXCd7jSsNMpeBXZp2s5hpNuFU994ojR1vGnCNQ7v'],
            "paid_tranches": 2,
        }

        logger.info("Successfully parsed contract account data")
        return contract_data
    except Exception as e:
        logger.error(f"Error parsing contract account data: {str(e)}")
        return None
"""


async def distribute_tranche(contract_address: str,) -> bool:
    """
    Distribute a tranche of a contract to the influencer.

    Args:
        contract_address: The contract address

    Returns:
        bool: True if the distribution was successful, False otherwise
    """
    try:
        # Create Solana client
        client = AsyncClient(SOLANA_TESTNET_RPC)

        # Convert contract address to PublicKey
        contract_pubkey = Pubkey.from_string(contract_address)

        # Convert the private key to a keypair
        owner_secret = WALLET_SECRET

        # Load owner's keypair
        if not owner_secret:
            raise ValueError("Owner secret key is required")
        owner_keypair = Keypair.from_base58_string(owner_secret)

        # Get contract data to find current recipient
        contract_data = await validate_contract_address(contract_address, True)
        if not contract_data:
            raise ValueError("Invalid contract")

        # Check if all tranches are paid
        if contract_data["paid_tranches"] >= contract_data["tranche_count"]:
            raise ValueError("All tranches have been paid")

        # Get current recipient
        current_recipient = Pubkey.from_string(
            contract_data["recipients"][contract_data["paid_tranches"]]
        )

        # Create instruction accounts
        accounts = [
            AccountMeta(pubkey=contract_pubkey, is_signer=False, is_writable=True),
            AccountMeta(pubkey=current_recipient, is_signer=False, is_writable=True),
            AccountMeta(
                pubkey=owner_keypair.pubkey(), is_signer=True, is_writable=False
            ),
        ]

        # Create the instruction
        instruction = TransactionInstruction(
            program_id=PROGRAM_ID,
            data=DISTRIBUTE_TRANCHE_DISCRIMINATOR,  # No additional data needed per IDL
            accounts=accounts,
        )

        # Create and sign transaction
        recent_blockhash = (await client.get_latest_blockhash()).value
        transaction = Transaction()
        transaction.recent_blockhash = recent_blockhash.blockhash
        transaction.fee_payer = owner_keypair.pubkey()
        transaction.add(instruction)

        # Sign and send transaction
        signed_tx = transaction.sign(owner_keypair)
        signature = await client.send_transaction(signed_tx, Confirmed)

        # Wait for confirmation
        await client.confirm_transaction(signature.value)

        # Close the client connection
        await client.close()

        logger.info(f"Successfully distributed tranche for contract {contract_address}")
        return True

    except Exception as e:
        logger.error(
            f"Error distributing tranche for contract {contract_address}: {str(e)}"
        )
        return False
