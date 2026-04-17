import { IEntitySchema } from "@drax/arch";

const AFILIATE_RELATIONS = ["titular", "conyuge", "familiar", "empresa", "tercero", "otro"];
const MATCH_METHODS = ["cuilCuit", "cuenta+banco", "nombre", "manual"];

const PayerEntitySchema: IEntitySchema = {
    module: "transferencias",
    name: "PayerEntity",
    collectionName: "payer_entities",
    apiBasePath: "payer-entities",
    apiTag: "PayerEntity",
    schema: {
        cuilCuit: { type: "string", required: false, header: true, search: true, index: true, unique: true },
        nombre: { type: "string", required: true, header: true, search: true, index: true },
        cuentas: {
            type: "array.object",
            required: false,
            header: false,
            schema: {
                numero: { type: "string", required: false, search: true, index: true },
                banco: { type: "string", required: false, search: true },
            },
        },
        afiliados: {
            type: "array.object",
            required: false,
            header: false,
            schema: {
                afiliadoId: {
                    type: "ref",
                    ref: "Affiliate",
                    refDisplay: "nombre",
                    required: false,
                },
                relacion: {
                    type: "enum",
                    enum: AFILIATE_RELATIONS,
                    required: false,
                },
                metodoMatch: {
                    type: "enum",
                    enum: MATCH_METHODS,
                    required: false,
                },
            },
        },
        ultimaVezDetectado: { type: "date", required: false, header: true, index: true },
    },
};

export default PayerEntitySchema;
export { PayerEntitySchema };
