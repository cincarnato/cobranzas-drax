
interface IAffiliateBase {
    apellidoNombre: string
    dni: string
    cuilCuit?: string
    tipo?: string
    titular?: any
    titularDni: string
    createdAt?: Date
    updatedAt?: Date
}

interface IAffiliate {
    _id: string
    apellidoNombre: string
    dni: string
    cuilCuit?: string
    tipo?: string
    titular?: any
    titularDni: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IAffiliateBase, 
IAffiliate
}
