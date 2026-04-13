
interface IPayerEntityBase {
    cuilCuit?: string
    nombre: string
    cuentas?: Array<{
    numero?: string
    banco?: string
    }>
    afiliados?: Array<{
    afiliadoId?: any
    relacion?: string
    metodoMatch?: string
    }>
    ultimaVezDetectado?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IPayerEntity {
    _id: string
    cuilCuit?: string
    nombre: string
    cuentas?: Array<{
    numero?: string
    banco?: string
    }>
    afiliados?: Array<{
    afiliadoId?: any
    relacion?: string
    metodoMatch?: string
    }>
    ultimaVezDetectado?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPayerEntityBase, 
IPayerEntity
}
