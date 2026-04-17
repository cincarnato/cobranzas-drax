import { z } from 'zod';
const BankMovementBaseSchema = z.object({
    Fecha: z.string().optional(),
    Concepto: z.string().optional(),
    NroCpbte: z.string().optional(),
    Debito: z.number().nullable().optional(),
    Credito: z.number().nullable().optional(),
    Saldo: z.number().nullable().optional(),
    Cod: z.string().optional(),
    fecha: z.coerce.date().nullable().optional(),
    importe: z.number().nullable().optional(),
    direccion: z.enum(['credito', 'debito']).optional(),
    tipoConcepto: z.enum(['VAR', 'FAC', 'CUO', 'EXP']).optional(),
    bancoOrigen: z.string().optional(),
    cuilCuitPagador: z.string().optional(),
    nombrePagador: z.string().optional(),
    numeroCuentaPagador: z.string().optional(),
    pagadorDetectadoId: z.coerce.string().optional().nullable(),
    afiliadoId: z.coerce.string().optional().nullable(),
    estado: z.enum(['pendiente', 'asignado', 'manual', 'ignorado']).optional().default('pendiente')
});
const BankMovementSchema = BankMovementBaseSchema
    .extend({
    _id: z.coerce.string(),
    pagadorDetectadoId: z.object({ _id: z.coerce.string(), nombre: z.string() }).nullable().optional(),
    afiliadoId: z.object({ _id: z.coerce.string(), nombre: z.string() }).nullable().optional()
});
export default BankMovementSchema;
export { BankMovementSchema, BankMovementBaseSchema };
