
import merge from "deepmerge";
import AffiliateMessages from "./Affiliate-i18n"
import AffiliateTypeMessages from "./AffiliateType-i18n"

const messages = merge.all([
    AffiliateMessages,
    AffiliateTypeMessages
])

export default messages
