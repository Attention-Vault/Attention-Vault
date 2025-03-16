import typing
from anchorpy.error import ProgramError


class AllTranchesPaid(ProgramError):
    def __init__(self) -> None:
        super().__init__(6000, "All tranches have been paid")

    code = 6000
    name = "AllTranchesPaid"
    msg = "All tranches have been paid"


class InvalidRecipient(ProgramError):
    def __init__(self) -> None:
        super().__init__(6001, "Invalid recipient for current tranche")

    code = 6001
    name = "InvalidRecipient"
    msg = "Invalid recipient for current tranche"


class InvalidRecipientsCount(ProgramError):
    def __init__(self) -> None:
        super().__init__(6002, "Number of recipients must match tranche count")

    code = 6002
    name = "InvalidRecipientsCount"
    msg = "Number of recipients must match tranche count"


class InvalidAmount(ProgramError):
    def __init__(self) -> None:
        super().__init__(6003, "Total amount must be greater than 0")

    code = 6003
    name = "InvalidAmount"
    msg = "Total amount must be greater than 0"


class InvalidTrancheCount(ProgramError):
    def __init__(self) -> None:
        super().__init__(6004, "Tranche count must be greater than 0")

    code = 6004
    name = "InvalidTrancheCount"
    msg = "Tranche count must be greater than 0"


class InvalidSigner(ProgramError):
    def __init__(self) -> None:
        super().__init__(6005, "Invalid signer - must be owner or authorized wallet")

    code = 6005
    name = "InvalidSigner"
    msg = "Invalid signer - must be owner or authorized wallet"


CustomError = typing.Union[
    AllTranchesPaid,
    InvalidRecipient,
    InvalidRecipientsCount,
    InvalidAmount,
    InvalidTrancheCount,
    InvalidSigner,
]
CUSTOM_ERROR_MAP: dict[int, CustomError] = {
    6000: AllTranchesPaid(),
    6001: InvalidRecipient(),
    6002: InvalidRecipientsCount(),
    6003: InvalidAmount(),
    6004: InvalidTrancheCount(),
    6005: InvalidSigner(),
}


def from_code(code: int) -> typing.Optional[CustomError]:
    maybe_err = CUSTOM_ERROR_MAP.get(code)
    if maybe_err is None:
        return None
    return maybe_err
