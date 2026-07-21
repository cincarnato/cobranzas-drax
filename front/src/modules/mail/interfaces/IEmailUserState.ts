interface IEmailUserState {
  _id: string
  inboundEmail: string
  user: string
  isRead?: boolean
  readAt?: Date
  isStarred?: boolean
}

export type {IEmailUserState}
