
interface IPayerAffiliate {
    name?: string
    documentNumber?: string
}

interface IPayerBase {
    strategy: 'EMAIL_FROM' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA'
    value: string
    affiliates?: IPayerAffiliate[]
    createdAt?: Date
    updatedAt?: Date
}

interface IPayer extends IPayerBase {
    _id: string
}

export type {
IPayerAffiliate,
IPayerBase, 
IPayer
}
