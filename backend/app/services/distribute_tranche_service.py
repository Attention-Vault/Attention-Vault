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

# Add the backend directory to the path so we can import modules from there
sys.path.append(str(Path(__file__).parents[1] / 'backend'))
from solders.instruction import Instruction, AccountMeta
# Import contract client modules
from app.contract_client.program_id import PROGRAM_ID
from app.contract_client.instructions.distribute_tranche import distribute_tranche, DistributeTrancheAccounts
from app.services.solana_service import validate_contract_address

# Default RPC URL (testnet)
SOLANA_RPC_URL = "https://api.testnet.sonic.game"

async def main(payment_contract_address: str = "72FV9FvT5nbb4W7bVqA2udJm3yq6QvUMQ1yDwfUQxU86"):
    """
    Main function to distribute a tranche for a given payment contract.
    """
    # Check command-line arguments for payment contract address
    # if len(sys.argv) < 2:
    #     print("Usage: python distribute_tranche.py <payment_contract_address>")
    #     sys.exit(1)

    # payment_contract_address = "72FV9FvT5nbb4W7bVqA2udJm3yq6QvUMQ1yDwfUQxU86"# sys.argv[1]
    print(f"Payment contract address: {payment_contract_address}")

    # Get wallet secret from environment variables
    wallet_secret_str = os.getenv("WALLET_SECRET")
    if not wallet_secret_str:
        print("Error: WALLET_SECRET environment variable is not set")
        sys.exit(1)

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

        # Get contract data to find current recipient
        contract_data = await validate_contract_address(payment_contract_address, True)
        if not contract_data:
            print("Error: Invalid contract or unable to fetch contract data")
            sys.exit(1)

        # Check if all tranches are paid
        if contract_data["paid_tranches"] >= contract_data["tranche_count"]:
            print("Error: All tranches have already been paid")
            sys.exit(1)

        # Get current recipient
        current_recipient_index = contract_data["paid_tranches"]
        if current_recipient_index >= len(contract_data["recipients"]):
            print("Error: Recipient index out of bounds")
            sys.exit(1)

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
        # instruction = distribute_tranche(accounts, PROGRAM_ID, [
        #     AccountMeta(pubkey=keypair.pubkey(), is_signer=True, is_writable=False)
        # ])
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
    except Exception as e:
        print(f"Error executing distribute_tranche: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())