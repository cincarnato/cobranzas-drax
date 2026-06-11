
import merge from "deepmerge";
import BankMovementMessages from "./BankMovement-i18n"
import PayerMessages from "./Payer-i18n"
import TransferEmailMessages from "./TransferEmail-i18n"

const messages = merge.all([
    BankMovementMessages,
    PayerMessages,
    TransferEmailMessages
])

export default messages
