
interface IAffiliateTypeBase {
    nombre: string
    descripcion?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IAffiliateType {
    _id: string
    nombre: string
    descripcion?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IAffiliateTypeBase, 
IAffiliateType
}
