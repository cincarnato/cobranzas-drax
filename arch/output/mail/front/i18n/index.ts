
import merge from "deepmerge";
import InboundEmailMessages from "./InboundEmail-i18n"
import MailboxMessages from "./Mailbox-i18n"
import OutboundEmailMessages from "./OutboundEmail-i18n"
import TypificationEmailMessages from "./TypificationEmail-i18n"

const messages = merge.all([
    InboundEmailMessages,
    MailboxMessages,
    OutboundEmailMessages,
    TypificationEmailMessages
])

export default messages
