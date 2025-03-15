from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.solana_service import validate_contract_address
from app.services.twitter_service import validate_twitter_handle
from app.services.llm_service import validate_text
from app.services.db_service import store_contract_data

router = APIRouter()

# Models for request/response
class NewContractRequest(BaseModel):
    contract_address: str
    verification_text: str
    twitter_handle: str

class ContractResponse(BaseModel):
    success: bool
    message: str

@router.post("/new_contract", response_model=ContractResponse)
async def create_new_contract(contract_data: NewContractRequest):
    """
    Create a new contract with the provided details.

    Validates:
    1. Contract address exists on Solana testnet
    2. Text is parseable by an LLM
    3. Twitter handle exists

    Then stores the data in MongoDB
    """
    try:
        # Validate contract address on Solana testnet
        if not await validate_contract_address(contract_data.contract_address):
            return ContractResponse(success=False, message="Invalid contract address")

        # Validate that text is parseable by LLM
        if not validate_text(contract_data.verification_text):
            return ContractResponse(success=False, message="Text validation failed")

        # Validate Twitter handle
        if not await validate_twitter_handle(contract_data.twitter_handle):
            return ContractResponse(success=False, message="Invalid Twitter handle")

        # Store data in MongoDB
        if not await store_contract_data(contract_data.dict()):
            return ContractResponse(success=False, message="Failed to store contract data")

        return ContractResponse(success=True, message="Contract created successfully")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Placeholder endpoints for /claim and /info - to be implemented later
@router.post("/claim")
async def claim_contract():
    return {"message": "Endpoint not implemented yet"}

@router.get("/info")
async def get_contract_info():
    return {"message": "Endpoint not implemented yet"}