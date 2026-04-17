
interface ICallListBase {
    group?: any
    user?: any
    file?: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }
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
    file?: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }
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
