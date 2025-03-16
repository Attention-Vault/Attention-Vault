import asyncio
import json
import requests
import base64
import struct
from pathlib import Path
from typing import Dict, Optional
from loguru import logger
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from anchorpy import Idl, Program, Provider

import json
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey as PublicKey
from anchorpy import Program, Provider, Wallet

# from solana.keypair import
from solders.keypair import Keypair

# Constants
SOLANA_TESTNET_RPC = "https://api.testnet.sonic.game"
IDL_PATH = (
    Path(__file__).parents[3]
    / "frontend"
    / "anchor"
    / "target"
    / "idl"
    / "frontend.json"
)


def load_idl() -> Dict:
    """Load and parse the IDL file."""
    try:
        with open(IDL_PATH) as f:
            return Idl.from_json(f.read())
    except Exception as e:
        logger.error(f"Error loading IDL file: {str(e)}")
        raise


def get_program_id() -> Pubkey:
    """Get program ID from IDL."""
    idl = load_idl()
    return Pubkey.from_string("Dwg2Z3cPq8p9dD7eaT3UqacBEwRBhisPDviLKyn5eF5j")
    # return Pubkey.from_string(idl["address"])


async def get_program_handle() -> Program:
    """Get the program handle from the IDL."""
    idl_data = load_idl()
    client = AsyncClient(SOLANA_TESTNET_RPC)
    provider = Provider(client, None)
    program_id = get_program_id()
    idl = Idl.from_json(idl_data)
    return Program(idl, program_id, provider)


async def fetch_contract_data(account_pubkey: str):
    """Fetch and print contract data from the blockchain."""
    client = AsyncClient(SOLANA_TESTNET_RPC)
    dummy_wallet = Wallet(Keypair())  # Read-only operation
    provider = Provider(client, dummy_wallet)
    IDL = load_idl()
    PROGRAM_ID = get_program_id()
    program = Program(IDL, PROGRAM_ID, provider)

    # Convert the provided public key to a Solana PublicKey object
    account_pubkey = PublicKey(account_pubkey)

    try:
        contract_data = await program.account["PaymentContract"].fetch(account_pubkey)

        print("\n--- Contract Data ---")
        print(f"Owner: {contract_data.owner}")
        print(f"Total Amount: {contract_data.total_amount}")
        print(f"Tranche Count: {contract_data.tranche_count}")
        print(f"Recipients: {contract_data.recipients}")
        print(f"Paid Tranches: {contract_data.paid_tranches}")

    except Exception as e:
        print("Error fetching contract data:", e)

    await client.close()


# Get account public key from user input


async def get_contract_data() -> Optional[Dict]:
    """Get contract data for the specific address."""
    try:
        client = AsyncClient(SOLANA_TESTNET_RPC)
        contract_address = "EjmSP39jgCud8DYBjm8w9RdKnbit9iBJsxd2bM3hs7FD"
        contract_pubkey = Pubkey.from_string(contract_address)
        program = await get_program_handle()

        # Get the account info
        account_info = await client.get_account_info(contract_pubkey)
        if not account_info.value:
            logger.error("Contract account not found")
            return None

        # Decode the account data
        try:
            parsed_data = program.account["PaymentContract"].decode(
                account_info.value.data
            )

            contract_data = {
                "owner": str(parsed_data.owner),
                "total_amount": parsed_data.total_amount,
                "tranche_count": parsed_data.tranche_count,
                "recipients": [str(recipient) for recipient in parsed_data.recipients],
                "paid_tranches": parsed_data.paid_tranches,
            }

            logger.info(
                f"Contract data retrieved: {json.dumps(contract_data, indent=2)}"
            )
            await client.close()
            return contract_data

        except Exception as decode_error:
            logger.error(f"Error decoding account data: {str(decode_error)}")
            raise

    except Exception as e:
        logger.error(f"Error getting contract data: {str(e)}")
        return None


def get_data_scratch(account_pubkey: str) -> Optional[Dict]:
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


if __name__ == "__main__":
    account_pubkey = "EjmSP39jgCud8DYBjm8w9RdKnbit9iBJsxd2bM3hs7FD"  # input("Enter the PaymentContract account public key: ")
    # asyncio.run(fetch_contract_data(account_pubkey))

    # Using the new get_data_scratch method
    contract_data = get_data_scratch(account_pubkey)
    if contract_data:
        print("\n--- Contract Data (Raw RPC) ---")
        print(f"Owner: {contract_data['owner']}")
        print(f"Total Amount: {contract_data['total_amount']}")
        print(f"Tranche Count: {contract_data['tranche_count']}")
        print(f"Recipients: {contract_data['recipients']}")
        print(f"Paid Tranches: {contract_data['paid_tranches']}")
