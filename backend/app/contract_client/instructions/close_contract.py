from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.instruction import Instruction, AccountMeta
from ..program_id import PROGRAM_ID


class CloseContractAccounts(typing.TypedDict):
    contract: Pubkey
    owner: Pubkey


def close_contract(
    accounts: CloseContractAccounts,
    program_id: Pubkey = PROGRAM_ID,
    remaining_accounts: typing.Optional[typing.List[AccountMeta]] = None,
) -> Instruction:
    keys: list[AccountMeta] = [
        AccountMeta(pubkey=accounts["contract"], is_signer=False, is_writable=True),
        AccountMeta(pubkey=accounts["owner"], is_signer=True, is_writable=True),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b'%\xf4"\xa8\\\xcaPj'
    encoded_args = b""
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
