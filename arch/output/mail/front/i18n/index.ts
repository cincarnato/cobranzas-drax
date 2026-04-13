
import merge from "deepmerge";
import InboundEmailMessages from "./InboundEmail-i18n"
import MailboxMessages from "./Mailbox-i18n"

const messages = merge.all([
    InboundEmailMessages,
    MailboxMessages
])

export default messages
