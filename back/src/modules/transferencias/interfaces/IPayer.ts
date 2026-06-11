
type PayerStrategy = 'EMAIL' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA'

interface IPayerLookupCriteria {
    strategy: PayerStrategy
    value: string
}

interface IPayerAdditionalAffiliate {
    name?: string
    email?: string
    documentNumber?: string
}

interface IPayerBase {
    strategy: PayerStrategy
    value: string
    affiliateName?: string
    affiliateEmail?: string
    affiliateDocumentNumber?: string
    additionalAffiliates?: IPayerAdditionalAffiliate[]
    createdAt?: Date
    updatedAt?: Date
}

interface IPayer extends IPayerBase {
    _id: string
}

export type {
PayerStrategy,
IPayerLookupCriteria,
IPayerAdditionalAffiliate,
IPayerBase, 
IPayer
}
