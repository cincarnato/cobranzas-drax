
interface IBonusBase {
    dni: string
    fullname: string
    plan: string
    appliedMonth: string
    paymentMethod: string
    bonus: string
    bonifiedNetValue: number
    status: string
    observation?: string
    createdBy: any
    createdAt?: Date
    updatedAt?: Date
}

interface IBonus {
    _id: string
    dni: string
    fullname: string
    plan: string
    appliedMonth: string
    paymentMethod: string
    bonus: string
    bonifiedNetValue: number
    status: string
    observation?: string
    createdBy: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IBonusBase, 
IBonus
}
