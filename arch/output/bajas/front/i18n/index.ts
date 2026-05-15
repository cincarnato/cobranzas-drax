
import merge from "deepmerge";
import BonusMessages from "./Bonus-i18n"

const messages = merge.all([
    BonusMessages
])

export default messages
