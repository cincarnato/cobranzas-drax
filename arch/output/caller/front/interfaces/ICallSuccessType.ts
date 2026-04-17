
interface ICallSuccessTypeBase {
    name?: string
    color?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICallSuccessType {
    _id: string
    name?: string
    color?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICallSuccessTypeBase, 
ICallSuccessType
}
