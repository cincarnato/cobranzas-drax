
interface ICallListBase {
    group?: any
    user?: any
    file?: string
    fileId?: any
    state?: string
    total?: number
    attempts?: number
    attemptsControl?: Array<{
    number?: number
    count?: number
    success?: number
    promises?: number
    }>
    success?: number
    promises?: number
    failed?: number
    isExportable?: boolean
    deadline?: Date
    name: string
    headers?: Array<string>
    createdAt?: Date
    updatedAt?: Date
}

interface ICallList {
    _id: string
    group?: any
    user?: any
    file?: string
    fileId?: any
    state?: string
    total?: number
    attempts?: number
    attemptsControl?: Array<{
    number?: number
    count?: number
    success?: number
    promises?: number
    }>
    success?: number
    promises?: number
    failed?: number
    isExportable?: boolean
    deadline?: Date
    name: string
    headers?: Array<string>
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICallListBase, 
ICallList
}
