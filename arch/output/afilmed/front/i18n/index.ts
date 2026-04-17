
import merge from "deepmerge";
import PadronMessages from "./Padron-i18n"

const messages = merge.all([
    PadronMessages
])

export default messages
