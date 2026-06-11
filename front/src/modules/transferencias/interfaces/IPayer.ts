
interface IPayerAdditionalAffiliate {
    name?: string
    email?: string
    documentNumber?: string
}

interface IPayerBase {
    strategy: 'EMAIL' | 'DNI_CUIL' | 'CBU_CVU' | 'NRO_CUENTA'
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
IPayerAdditionalAffiliate,
IPayerBase, 
IPayer
}
