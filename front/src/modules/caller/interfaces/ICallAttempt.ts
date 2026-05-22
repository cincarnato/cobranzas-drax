interface ICallAttemptBase {
    date?: Date
    user?: any
    result: string
    callListName: string
    callLogId: string
    callLog: any
    createdAt?: Date
    updatedAt?: Date
}

interface ICallAttempt {
    _id: string
    date?: Date
    user?: any
    result: string
    callListName: string
    callLogId: string
    callLog: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
    ICallAttemptBase,
    ICallAttempt
}
