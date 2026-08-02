
import merge from "deepmerge";
import InboundEmailMessages from "./InboundEmail-i18n"
import MailboxMessages from "./Mailbox-i18n"
import MailboxUserSettingMessages from "./MailboxUserSetting-i18n"
import OutboundEmailMessages from "./OutboundEmail-i18n"
import EmailSupervisionMessages from "./EmailSupervision-i18n"
import MailModuleMessages from "./MailModule-i18n"

const messages = merge.all([
    InboundEmailMessages,
    MailboxMessages,
    MailboxUserSettingMessages,
    OutboundEmailMessages,
    EmailSupervisionMessages,
    MailModuleMessages
])

export default messages
