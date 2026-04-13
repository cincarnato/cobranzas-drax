
import merge from "deepmerge";
import CallFailedTypeMessages from "./CallFailedType-i18n"
import CallListMessages from "./CallList-i18n"
import CallLogMessages from "./CallLog-i18n"
import CallSuccessTypeMessages from "./CallSuccessType-i18n"

const messages = merge.all([
    CallFailedTypeMessages,
    CallListMessages,
    CallLogMessages,
    CallSuccessTypeMessages
])

export default messages
