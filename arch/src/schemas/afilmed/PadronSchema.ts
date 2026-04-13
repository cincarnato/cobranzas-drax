import { IEntitySchema } from "@drax/arch";

const PadronSchema: IEntitySchema = {
    module: "afilmed",
    name: "Padron",
    apiBasePath: "padrones",
    apiTag: "Padron",
    schema: {
        origen: { type: "string", required: false, header: true },
        ente: { type: "number", required: false, header: true },
        contra: { type: "string", required: true, header: true, search: true, index: true },
        ape_nom: { type: "string", required: true, header: true, search: true },
        cant_inte: { type: "number", required: false, header: true },
        plan_codi: { type: "string", required: false, header: true },
        domicilio: { type: "string", required: false, header: true, search: true },
        loca: { type: "string", required: false, header: true, search: true },
        tele: { type: "string", required: false, header: true },
        deuda1: { type: "number", required: false, header: true, default: 0 },
        deuda2: { type: "number", required: false, header: true, default: 0 },
        deuda3: { type: "number", required: false, header: true, default: 0 },
        deuda4: { type: "number", required: false, header: true, default: 0 },
        periodo1: { type: "date", required: false, header: true },
        periodo2: { type: "date", required: false, header: true },
        periodo3: { type: "date", required: false, header: true },
        periodo4: { type: "date", required: false, header: true },
        subtotal: { type: "number", required: false, header: true, default: 0 },
        pago_forma: { type: "string", required: false, header: true },
        cobrador: { type: "string", required: false, header: true },
        total_ctacte: { type: "number", required: false, header: true, default: 0 },
        baja_fecha: { type: "date", required: false, header: true },
        nro_ref_elect: { type: "string", required: false, header: true, search: true },
        celular: { type: "string", required: false, header: true, search: true },
        deno_provin: { type: "string", required: false, header: true, search: true },
    }
};

export default PadronSchema;
export { PadronSchema };
