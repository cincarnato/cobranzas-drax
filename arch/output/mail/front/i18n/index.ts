
import merge from "deepmerge";
import InboundEmailMessages from "./InboundEmail-i18n"
import MailboxMessages from "./Mailbox-i18n"
import MailboxUserSettingMessages from "./MailboxUserSetting-i18n"
import OutboundEmailMessages from "./OutboundEmail-i18n"
import TemplateEmailMessages from "./TemplateEmail-i18n"

const messages = merge.all([
    InboundEmailMessages,
    MailboxMessages,
    MailboxUserSettingMessages,
    OutboundEmailMessages,
    TemplateEmailMessages
])

export default messages
