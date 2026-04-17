
interface IBankMovementBase {
    Fecha?: string
    Concepto?: string
    NroCpbte?: string
    Debito?: number
    Credito?: number
    Saldo?: number
    Cod?: string
    fecha?: Date
    importe?: number
    direccion?: string
    tipoConcepto?: string
    bancoOrigen?: string
    cuilCuitPagador?: string
    nombrePagador?: string
    numeroCuentaPagador?: string
    pagadorDetectadoId?: any
    afiliadoId?: any
    estado?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IBankMovement {
    _id: string
    Fecha?: string
    Concepto?: string
    NroCpbte?: string
    Debito?: number
    Credito?: number
    Saldo?: number
    Cod?: string
    fecha?: Date
    importe?: number
    direccion?: string
    tipoConcepto?: string
    bancoOrigen?: string
    cuilCuitPagador?: string
    nombrePagador?: string
    numeroCuentaPagador?: string
    pagadorDetectadoId?: any
    afiliadoId?: any
    estado?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IBankMovementBase, 
IBankMovement
}
