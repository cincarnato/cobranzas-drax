
interface ICallFailedTypeBase {
    name?: string
    color?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICallFailedType {
    _id: string
    name?: string
    color?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICallFailedTypeBase, 
ICallFailedType
}
