
interface IPadronBase {
    origen?: string
    ente?: number
    contra: string
    ape_nom: string
    cant_inte?: number
    plan_codi?: string
    domicilio?: string
    loca?: string
    tele?: string
    deuda1?: number
    deuda2?: number
    deuda3?: number
    deuda4?: number
    periodo1?: Date
    periodo2?: Date
    periodo3?: Date
    periodo4?: Date
    subtotal?: number
    pago_forma?: string
    cobrador?: string
    total_ctacte?: number
    baja_fecha?: Date
    nro_ref_elect?: string
    celular?: string
    deno_provin?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IPadron {
    _id: string
    origen?: string
    ente?: number
    contra: string
    ape_nom: string
    cant_inte?: number
    plan_codi?: string
    domicilio?: string
    loca?: string
    tele?: string
    deuda1?: number
    deuda2?: number
    deuda3?: number
    deuda4?: number
    periodo1?: Date
    periodo2?: Date
    periodo3?: Date
    periodo4?: Date
    subtotal?: number
    pago_forma?: string
    cobrador?: string
    total_ctacte?: number
    baja_fecha?: Date
    nro_ref_elect?: string
    celular?: string
    deno_provin?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPadronBase, 
IPadron
}
