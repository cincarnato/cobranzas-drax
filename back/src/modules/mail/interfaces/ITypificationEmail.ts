
interface ITypificationEmailBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ITypificationEmail {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITypificationEmailBase, 
ITypificationEmail
}
