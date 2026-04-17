
import merge from "deepmerge";
import BankMovementMessages from "./BankMovement-i18n"
import PayerEntityMessages from "./PayerEntity-i18n"
import TransferEmailMessages from "./TransferEmail-i18n"

const messages = merge.all([
    BankMovementMessages,
    PayerEntityMessages,
    TransferEmailMessages
])

export default messages
