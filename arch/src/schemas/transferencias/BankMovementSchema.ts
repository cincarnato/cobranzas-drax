import { IEntitySchema } from "@drax/arch";

const MOVEMENT_DIRECTIONS = ["credito", "debito"];
const MOVEMENT_CONCEPT_TYPES = ["VAR", "FAC", "CUO", "EXP"];
const MOVEMENT_STATES = ["pendiente", "asignado", "manual", "ignorado"];

const BankMovementSchema: IEntitySchema = {
    module: "transferencias",
    name: "BankMovement",
    collectionName: "bank_movements",
    apiBasePath: "bank-movements",
    apiTag: "BankMovement",
    schema: {
        Fecha: { type: "string", required: false, header: true, search: true },
        Concepto: { type: "string", required: false, header: true, search: true },
        NroCpbte: { type: "string", required: false, header: true, search: true },
        Debito: { type: "number", required: false, header: true, default: 0 },
        Credito: { type: "number", required: false, header: true, default: 0 },
        Saldo: { type: "number", required: false, header: true },
        Cod: { type: "string", required: false, header: true, search: true },

        fecha: { type: "date", required: false, header: true, index: true },
        importe: { type: "number", required: false, header: true, index: true },
        direccion: {
            type: "enum",
            enum: MOVEMENT_DIRECTIONS,
            required: false,
            header: true,
            index: true,
        },
        tipoConcepto: {
            type: "enum",
            enum: MOVEMENT_CONCEPT_TYPES,
            required: false,
            header: true,
            index: true,
        },
        bancoOrigen: { type: "string", required: false, header: true, search: true },
        cuilCuitPagador: { type: "string", required: false, header: true, search: true, index: true },
        nombrePagador: { type: "string", required: false, header: true, search: true },
        numeroCuentaPagador: { type: "string", required: false, header: true, search: true, index: true },
        pagadorDetectadoId: {
            type: "ref",
            ref: "PayerEntity",
            refDisplay: "nombre",
            required: false,
            header: true,
        },
        afiliadoId: {
            type: "ref",
            ref: "Affiliate",
            refDisplay: "nombre",
            required: false,
            header: true,
        },
        estado: {
            type: "enum",
            enum: MOVEMENT_STATES,
            default: "pendiente",
            required: false,
            header: true,
            index: true,
        },
    },
};

export default BankMovementSchema;
export { BankMovementSchema };
