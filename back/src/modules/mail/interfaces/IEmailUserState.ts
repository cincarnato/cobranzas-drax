interface IEmailUserStateBase {
    inboundEmail: any
    user: any
    isRead?: boolean
    readAt?: Date
    isStarred?: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface IEmailUserState extends IEmailUserStateBase {
    _id: string
}

export type {IEmailUserStateBase, IEmailUserState}
