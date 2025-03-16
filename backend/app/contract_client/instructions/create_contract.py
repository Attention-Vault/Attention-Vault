from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from solders.instruction import Instruction, AccountMeta
from anchorpy.borsh_extension import BorshPubkey
from construct import Construct
import borsh_construct as borsh
from ..program_id import PROGRAM_ID


class CreateContractArgs(typing.TypedDict):
    total_amount: int
    tranche_count: int
    recipients: list[Pubkey]


layout = borsh.CStruct(
    "total_amount" / borsh.U64,
    "tranche_count" / borsh.U64,
    "recipients" / borsh.Vec(typing.cast(Construct, BorshPubkey)),
)


class CreateContractAccounts(typing.TypedDict):
    contract: Pubkey
    owner: Pubkey


def create_contract(
    args: CreateContractArgs,
    accounts: CreateContractAccounts,
    program_id: Pubkey = PROGRAM_ID,
    remaining_accounts: typing.Optional[typing.List[AccountMeta]] = None,
) -> Instruction:
    keys: list[AccountMeta] = [
        AccountMeta(pubkey=accounts["contract"], is_signer=True, is_writable=True),
        AccountMeta(pubkey=accounts["owner"], is_signer=True, is_writable=True),
        AccountMeta(pubkey=SYS_PROGRAM_ID, is_signer=False, is_writable=False),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b"\xf40\xf4\xb2\xd8Xz4"
    encoded_args = layout.build(
        {
            "total_amount": args["total_amount"],
            "tranche_count": args["tranche_count"],
            "recipients": args["recipients"],
        }
    )
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
