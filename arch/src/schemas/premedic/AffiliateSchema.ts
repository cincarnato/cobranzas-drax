import { IEntitySchema } from "@drax/arch";

const AffiliateSchema: IEntitySchema = {
    module: "premedic",
    name: "Affiliate",
    collectionName: "Affiliate",
    apiBasePath: "affiliates",
    apiTag: "premedic",
    schema: {
        apellidoNombre: { type: "string", required: true, header: true, search: true, index: true },
        dni: { type: "string", required: true, header: true, search: true, index: true, unique: true },
        cuilCuit: { type: "string", required: false, header: true, search: true, index: true },
        /**
         * TIPO:
         * Titular
         * Conyuge
         * Hijo
         * Adic Menor de 1 año
         * Adic Menor de 25 años
         * Adic Mayor de 26 años a 35 año
         */
        tipo: { type: "string",  required: false, header: true, search: true, index: true },
        titular: { type: "ref", ref:"Affiliate",refDisplay: "apellidoNombre", required: false, header: true, search: true, index: true },
        titularDni: { type: "string", required: true, header: true, search: true, index: true, unique: true },
    },
};

export default AffiliateSchema;
export { AffiliateSchema };
