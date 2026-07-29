
interface IInternalTransferBonusBase {
    dni: string
    fullname: string
    appliedMonth: string
    bonifiedValue: number
    bonusType: string
    bankDataAttachment?: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }
    status: string
    observation?: string
    createdBy: any
    createdAt?: Date
    updatedAt?: Date
}

interface IInternalTransferBonus {
    _id: string
    dni: string
    fullname: string
    appliedMonth: string
    bonifiedValue: number
    bonusType: string
    bankDataAttachment?: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }
    status: string
    observation?: string
    createdBy: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IInternalTransferBonusBase, 
IInternalTransferBonus
}
