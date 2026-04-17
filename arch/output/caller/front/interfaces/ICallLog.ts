
interface ICallLogBase {
    callList: any
    attempts?: number
    notes?: string
    typification?: string
    state?: string
    promiseDate?: Date
    done?: boolean
    data?: Record<string, any>
    createdAt?: Date
    updatedAt?: Date
}

interface ICallLog {
    _id: string
    callList: any
    attempts?: number
    notes?: string
    typification?: string
    state?: string
    promiseDate?: Date
    done?: boolean
    data?: Record<string, any>
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICallLogBase, 
ICallLog
}
