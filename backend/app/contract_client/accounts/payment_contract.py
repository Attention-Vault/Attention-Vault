import typing
from dataclasses import dataclass
from construct import Construct
from solders.pubkey import Pubkey
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Commitment
import borsh_construct as borsh
from anchorpy.coder.accounts import ACCOUNT_DISCRIMINATOR_SIZE
from anchorpy.error import AccountInvalidDiscriminator
from anchorpy.utils.rpc import get_multiple_accounts
from anchorpy.borsh_extension import BorshPubkey
from ..program_id import PROGRAM_ID


class PaymentContractJSON(typing.TypedDict):
    owner: str
    total_amount: int
    tranche_count: int
    recipients: list[str]
    paid_tranches: int


@dataclass
class PaymentContract:
    discriminator: typing.ClassVar = b"\x977\x18\xa5\x0c\xce&\x1f"
    layout: typing.ClassVar = borsh.CStruct(
        "owner" / BorshPubkey,
        "total_amount" / borsh.U64,
        "tranche_count" / borsh.U64,
        "recipients" / borsh.Vec(typing.cast(Construct, BorshPubkey)),
        "paid_tranches" / borsh.U64,
    )
    owner: Pubkey
    total_amount: int
    tranche_count: int
    recipients: list[Pubkey]
    paid_tranches: int

    @classmethod
    async def fetch(
        cls,
        conn: AsyncClient,
        address: Pubkey,
        commitment: typing.Optional[Commitment] = None,
        program_id: Pubkey = PROGRAM_ID,
    ) -> typing.Optional["PaymentContract"]:
        resp = await conn.get_account_info(address, commitment=commitment)
        info = resp.value
        if info is None:
            return None
        if info.owner != program_id:
            raise ValueError("Account does not belong to this program")
        bytes_data = info.data
        return cls.decode(bytes_data)

    @classmethod
    async def fetch_multiple(
        cls,
        conn: AsyncClient,
        addresses: list[Pubkey],
        commitment: typing.Optional[Commitment] = None,
        program_id: Pubkey = PROGRAM_ID,
    ) -> typing.List[typing.Optional["PaymentContract"]]:
        infos = await get_multiple_accounts(conn, addresses, commitment=commitment)
        res: typing.List[typing.Optional["PaymentContract"]] = []
        for info in infos:
            if info is None:
                res.append(None)
                continue
            if info.account.owner != program_id:
                raise ValueError("Account does not belong to this program")
            res.append(cls.decode(info.account.data))
        return res

    @classmethod
    def decode(cls, data: bytes) -> "PaymentContract":
        if data[:ACCOUNT_DISCRIMINATOR_SIZE] != cls.discriminator:
            raise AccountInvalidDiscriminator(
                "The discriminator for this account is invalid"
            )
        dec = PaymentContract.layout.parse(data[ACCOUNT_DISCRIMINATOR_SIZE:])
        return cls(
            owner=dec.owner,
            total_amount=dec.total_amount,
            tranche_count=dec.tranche_count,
            recipients=dec.recipients,
            paid_tranches=dec.paid_tranches,
        )

    def to_json(self) -> PaymentContractJSON:
        return {
            "owner": str(self.owner),
            "total_amount": self.total_amount,
            "tranche_count": self.tranche_count,
            "recipients": list(map(lambda item: str(item), self.recipients)),
            "paid_tranches": self.paid_tranches,
        }

    @classmethod
    def from_json(cls, obj: PaymentContractJSON) -> "PaymentContract":
        return cls(
            owner=Pubkey.from_string(obj["owner"]),
            total_amount=obj["total_amount"],
            tranche_count=obj["tranche_count"],
            recipients=list(
                map(lambda item: Pubkey.from_string(item), obj["recipients"])
            ),
            paid_tranches=obj["paid_tranches"],
        )
