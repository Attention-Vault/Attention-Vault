from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from typing import Dict, Any, Optional, List
from app.services.solana_service import validate_contract_address, distribute_tranche
from app.services.twitter_service import validate_twitter_handle, validate_post_url, get_post_metrics
from app.services.llm_service import validate_text, verify_post_content
from app.services.db_service import store_contract_data, get_contract, update_contract_with_post

router = APIRouter()

# Models for request/response
class NewContractRequest(BaseModel):
    contract_address: str
    verification_text: str
    twitter_handle: str

class ClaimRequest(BaseModel):
    contract_address: str
    post_url: HttpUrl

class ContractResponse(BaseModel):
    success: bool
    message: str
    reason: Optional[str] = None

class ContractInfoResponse(BaseModel):
    contract_address: str
    twitter_handle: str
    verification_text: str
    post_url: Optional[str] = None
    created_at: str
    status: str
    tranches_distributed: Optional[int] = 0
    metrics: Optional[Dict[str, Any]] = None

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
        success, reason = await store_contract_data(contract_data.dict())
        if not success:
            if reason == "already_exists":
                return ContractResponse(
                    success=False,
                    message=f"Contract with address {contract_data.contract_address} already exists",
                    reason=reason
                )
            return ContractResponse(success=False, message="Failed to store contract data", reason=reason)

        return ContractResponse(success=True, message="Contract created successfully")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Implement /claim endpoint
@router.post("/claim", response_model=ContractResponse)
async def claim_contract(claim_data: ClaimRequest):
    """
    Claims a contract by providing a Twitter post URL that fulfills the contract requirements.

    Validates:
    1. Contract exists in database
    2. Post URL is valid and accessible
    3. Post is authored by the expected Twitter handle
    4. Post content matches verification text requirements
    5. Post has enough likes to qualify for tranches

    Then calls distribute_tranche on the contract for each qualified tranche
    """
    try:
        # Get contract data from database
        contract = await get_contract(claim_data.contract_address)
        if not contract:
            return ContractResponse(success=False, message="Contract not found")

        # Check if contract is already claimed
        if contract.get("status") == "claimed":
            return ContractResponse(success=False, message="Contract has already been claimed", reason="already_claimed")

        # Get contract details
        twitter_handle = contract["twitter_handle"]
        verification_text = contract["verification_text"]

        # Validate post URL
        post_info = await validate_post_url(claim_data.post_url)
        if not post_info:
            return ContractResponse(success=False, message="Invalid post URL")

        # Check if the post author matches the expected Twitter handle
        if post_info["author_handle"].lower() != twitter_handle.lower().strip('@'):
            return ContractResponse(
                success=False,
                message=f"Post not authored by the expected influencer: {twitter_handle}",
                reason="wrong_author"
            )

        # Verify post content against verification text requirements using LLM
        content_valid = await verify_post_content(post_info["text"], verification_text)
        if not content_valid:
            return ContractResponse(
                success=False,
                message="Post content does not match verification requirements",
                reason="content_mismatch"
            )

        # Get post metrics
        metrics = await get_post_metrics(claim_data.post_url)
        if not metrics:
            return ContractResponse(success=False, message="Failed to retrieve post metrics")

        # Get tranche thresholds from the contract on Solana
        tranche_info = await validate_contract_address(claim_data.contract_address, get_tranches=True)
        if not tranche_info or "tranches" not in tranche_info:
            return ContractResponse(success=False, message="Failed to retrieve tranche information")

        # Calculate how many tranches the post qualifies for based on likes
        qualified_tranches = 0
        like_count = metrics.get("like_count", 0)

        for tranche in tranche_info["tranches"]:
            if like_count >= tranche["threshold"]:
                qualified_tranches += 1

        if qualified_tranches == 0:
            return ContractResponse(
                success=False,
                message=f"Post does not have enough likes to qualify for any tranche. "
                        f"Current likes: {like_count}",
                reason="insufficient_likes"
            )

        # Call distribute_tranche for each qualified tranche
        distributed_count = 0
        for i in range(qualified_tranches):
            tranche_result = await distribute_tranche(claim_data.contract_address, i)
            if tranche_result:
                distributed_count += 1

        # Update contract in database with post URL and metrics
        update_data = {
            "post_url": str(claim_data.post_url),
            "metrics": metrics,
            "status": "claimed",
            "tranches_distributed": distributed_count,
            "claimed_at": "now()"  # MongoDB will handle this as current time
        }

        await update_contract_with_post(claim_data.contract_address, update_data)

        return ContractResponse(
            success=True,
            message=f"Successfully claimed contract and distributed {distributed_count} tranches"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Implement /info endpoint
@router.get("/info/{contract_address}", response_model=ContractInfoResponse)
async def get_contract_info(contract_address: str):
    """
    Retrieves all metadata associated with a contract.

    Returns:
    Contract details including influencer handle, verification text, post URL (if claimed), etc.
    """
    try:
        # Get contract data from database
        contract = await get_contract(contract_address)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")

        # Format the response
        response = ContractInfoResponse(
            contract_address=contract["contract_address"],
            twitter_handle=contract["twitter_handle"],
            verification_text=contract["verification_text"],
            created_at=contract["created_at"].isoformat() if "created_at" in contract else "",
            status=contract["status"],
            post_url=contract.get("post_url"),
            tranches_distributed=contract.get("tranches_distributed", 0),
            metrics=contract.get("metrics")
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")