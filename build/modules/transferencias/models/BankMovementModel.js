import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const BankMovementSchema = new mongoose.Schema({
    Fecha: { type: String, required: false, index: false, unique: false },
    Concepto: { type: String, required: false, index: false, unique: false },
    NroCpbte: { type: String, required: false, index: false, unique: false },
    Debito: { type: Number, required: false, index: false, unique: false },
    Credito: { type: Number, required: false, index: false, unique: false },
    Saldo: { type: Number, required: false, index: false, unique: false },
    Cod: { type: String, required: false, index: false, unique: false },
    fecha: { type: Date, required: false, index: true, unique: false },
    importe: { type: Number, required: false, index: true, unique: false },
    direccion: { type: String, enum: ['credito', 'debito'], required: false, index: true, unique: false },
    tipoConcepto: { type: String, enum: ['VAR', 'FAC', 'CUO', 'EXP'], required: false, index: true, unique: false },
    bancoOrigen: { type: String, required: false, index: false, unique: false },
    cuilCuitPagador: { type: String, required: false, index: true, unique: false },
    nombrePagador: { type: String, required: false, index: false, unique: false },
    numeroCuentaPagador: { type: String, required: false, index: true, unique: false },
    pagadorDetectadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'PayerEntity', required: false, index: false, unique: false },
    afiliadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: false, index: false, unique: false },
    estado: { type: String, enum: ['pendiente', 'asignado', 'manual', 'ignorado'], required: false, index: true, unique: false }
}, { timestamps: true });
BankMovementSchema.plugin(uniqueValidator, { message: 'validation.unique' });
BankMovementSchema.plugin(mongoosePaginate);
BankMovementSchema.virtual("id").get(function () {
    return this._id.toString();
});
BankMovementSchema.set('toJSON', { getters: true, virtuals: true });
BankMovementSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'BankMovement';
const COLLECTION_NAME = 'bank_movements';
const BankMovementModel = mongoose.model(MODEL_NAME, BankMovementSchema, COLLECTION_NAME);
export { BankMovementSchema, BankMovementModel };
export default BankMovementModel;
