from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.instruction import Instruction, AccountMeta
from ..program_id import PROGRAM_ID


class DistributeTrancheAccounts(typing.TypedDict):
    contract: Pubkey
    recipient: Pubkey
    owner: Pubkey


def distribute_tranche(
    accounts: DistributeTrancheAccounts,
    program_id: Pubkey = PROGRAM_ID,
    remaining_accounts: typing.Optional[typing.List[AccountMeta]] = None,
) -> Instruction:
    keys: list[AccountMeta] = [
        AccountMeta(pubkey=accounts["contract"], is_signer=False, is_writable=True),
        AccountMeta(pubkey=accounts["recipient"], is_signer=False, is_writable=True),
        AccountMeta(pubkey=accounts["owner"], is_signer=True, is_writable=False),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b"\x04eutz\xf2\xd3["
    encoded_args = b""
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
