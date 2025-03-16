#!/usr/bin/env python3
import os
import sys
import asyncio
import json
from pathlib import Path
import base58
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solana.rpc.async_api import AsyncClient
from solana.transaction import Transaction
from anchorpy import Provider
import base64
import requests
from loguru import logger

# Add the backend directory to the path so we can import modules from there
sys.path.append(str(Path(__file__).parents[1] / 'backend'))
from solders.instruction import Instruction, AccountMeta
# Import contract client modules
from app.contract_client.program_id import PROGRAM_ID
from app.contract_client.instructions.distribute_tranche import distribute_tranche, DistributeTrancheAccounts

# Default RPC URL (testnet)
SOLANA_RPC_URL = "https://api.testnet.sonic.game"

async def get_contract_data(payment_contract_address: str) -> dict:
    """
    Get contract data directly without relying on solana_service.
    This is a simplified version of validate_contract_address that gets contract data.
    """
    try:
        # Solana RPC request payload for getAccountInfo
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAccountInfo",
            "params": [payment_contract_address, {"encoding": "base64"}],
        }

        # Make RPC request
        response = requests.post(SOLANA_RPC_URL, json=payload)
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
        # 1. Discriminator (8 bytes)
        # 2. Owner (32 bytes) - Pubkey
        # 3. Total amount (8 bytes) - u64
        # 4. Tranche count (8 bytes) - u64
        # 5. Recipients vector (4 bytes for length + n*32 bytes for pubkeys)
        # 6. Paid tranches (8 bytes) - u64

        # Skip 8-byte discriminator
        offset = 8

        # Extract owner pubkey (32 bytes)
        owner_bytes = account_data[offset : offset + 32]
        owner = str(Pubkey(owner_bytes))
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
            recipient = str(Pubkey(recipient_bytes))
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

        return contract_data

    except Exception as e:
        logger.error(f"Error getting contract data: {str(e)}")
        return None

async def main(payment_contract_address: str ):
    """
    Main function to distribute a tranche for a given payment contract.
    """
    print(f"Payment contract address: {payment_contract_address}")

    # Get wallet secret from environment variables
    wallet_secret_str = os.getenv("WALLET_SECRET")
    if not wallet_secret_str:
        print("Error: WALLET_SECRET environment variable is not set")
        return False

    try:
        # Parse the wallet secret (array format)
        try:
            wallet_secret_array = json.loads(wallet_secret_str)
            secret_key = bytes(wallet_secret_array)
            keypair = Keypair.from_bytes(secret_key)
        except json.JSONDecodeError:
            # Try base58 format if JSON parsing fails
            keypair = Keypair.from_base58_string(wallet_secret_str)

        print(f"Using wallet: {keypair.pubkey()}")

        # Connect to Solana network
        client = AsyncClient(SOLANA_RPC_URL)

        # Create an anchorpy Provider with our keypair and client
        provider = Provider(client, keypair)

        # Convert payment contract address to PublicKey
        contract_pubkey = Pubkey.from_string(payment_contract_address)

        # Get contract data to find current recipient using our local function
        # instead of importing from solana_service
        contract_data = await get_contract_data(payment_contract_address)
        if not contract_data:
            print("Error: Invalid contract or unable to fetch contract data")
            await client.close()
            return False

        # Check if all tranches are paid
        if contract_data["paid_tranches"] >= contract_data["tranche_count"]:
            print("Error: All tranches have already been paid")
            await client.close()
            return False

        # Get current recipient
        current_recipient_index = contract_data["paid_tranches"]
        if current_recipient_index >= len(contract_data["recipients"]):
            print("Error: Recipient index out of bounds")
            await client.close()
            return False

        current_recipient = Pubkey.from_string(contract_data["recipients"][current_recipient_index])

        print(f"Current recipient: {current_recipient}")
        print(f"Paid tranches: {contract_data['paid_tranches']} of {contract_data['tranche_count']}")

        # Prepare the accounts for the instruction
        accounts = DistributeTrancheAccounts(
            contract=contract_pubkey,
            recipient=current_recipient,
            owner=keypair.pubkey()
        )

        # Create the distribute_tranche instruction
        instruction = distribute_tranche(accounts, PROGRAM_ID)

        # Create a transaction and add the instruction
        transaction = Transaction().add(instruction)
        blockhash_resp = await client.get_latest_blockhash()
        transaction.recent_blockhash = blockhash_resp.value.blockhash
        transaction.sign(keypair)

        # Send and confirm the transaction using the provider
        # The provider will handle signing with the keypair
        signature = await provider.send(transaction)

        # Close the client connection
        await client.close()

        print(f"Transaction successful! Signature: {signature}")
        return True
    except Exception as e:
        print(f"Error executing distribute_tranche: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python distribute_tranche.py <payment_contract_address>")
        sys.exit(1)

    payment_contract_address = sys.argv[1]
    asyncio.run(main(payment_contract_address))