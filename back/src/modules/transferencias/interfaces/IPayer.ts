
type PayerStrategy = 'EMAIL_FROM' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA'

interface IPayerLookupCriteria {
    strategy: PayerStrategy
    value: string
}

interface IPayerAffiliate {
    name?: string
    documentNumber?: string
}

interface IPayerBase {
    strategy: PayerStrategy
    value: string
    affiliates?: IPayerAffiliate[]
    createdAt?: Date
    updatedAt?: Date
}

interface IPayer extends IPayerBase {
    _id: string
}

export type {
PayerStrategy,
IPayerLookupCriteria,
IPayerAffiliate,
IPayerBase, 
IPayer
}
