import type {IInboundEmail} from "./IInboundEmail";
import type {IMailbox} from "./IMailbox";
import type {IOutboundEmail} from "./IOutboundEmail";
import type {IEmailUserState} from "./IEmailUserState";

type EmailManagementView = "PENDING" | "ASSIGNED_TO_ME" | "ASSIGNED" | "CLOSED" | "STARRED" | "ALL"
type EmailDensity = "comfortable" | "compact"

type EmailManagementPermissions = {
  canAssign: boolean
  canReassign: boolean
  canReply: boolean
  canClose: boolean
  canViewTechnicalDetails: boolean
}

type EmailManagementListItem = IInboundEmail & {
  userState?: IEmailUserState | null
}

type EmailManagementListResult = {
  items: EmailManagementListItem[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

type EmailThreadEntry = {
  id: string
  type: "INBOUND" | "OUTBOUND"
  date: Date | string
  inboundEmail?: IInboundEmail
  outboundEmail?: IOutboundEmail
}

type EmailManagementDetail = {
  inboundEmail: EmailManagementListItem
  mailbox: IMailbox
  assignedUser?: any
  userState?: IEmailUserState | null
  inboundThread: IInboundEmail[]
  outboundThread: IOutboundEmail[]
}

type EmailManagementFilters = {
  category?: string
  priorities: string[]
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  hasAttachments?: boolean
  withoutReply?: boolean
  tags: string[]
}

export type {
  EmailDensity,
  EmailManagementDetail,
  EmailManagementFilters,
  EmailManagementListItem,
  EmailManagementListResult,
  EmailManagementPermissions,
  EmailManagementView,
  EmailThreadEntry,
}
