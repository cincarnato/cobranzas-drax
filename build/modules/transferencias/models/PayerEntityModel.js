import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const PayerEntitySchema = new mongoose.Schema({
    cuilCuit: { type: String, required: false, index: true, unique: true },
    nombre: { type: String, required: true, index: true, unique: false },
    cuentas: [{
            numero: { type: String, required: false, index: true, unique: false },
            banco: { type: String, required: false, index: false, unique: false }
        }],
    afiliados: [{
            afiliadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: false, index: false, unique: false },
            relacion: { type: String, enum: ['titular', 'conyuge', 'familiar', 'empresa', 'tercero', 'otro'], required: false, index: false, unique: false },
            metodoMatch: { type: String, enum: ['cuilCuit', 'cuenta+banco', 'nombre', 'manual'], required: false, index: false, unique: false }
        }],
    ultimaVezDetectado: { type: Date, required: false, index: true, unique: false }
}, { timestamps: true });
PayerEntitySchema.plugin(uniqueValidator, { message: 'validation.unique' });
PayerEntitySchema.plugin(mongoosePaginate);
PayerEntitySchema.virtual("id").get(function () {
    return this._id.toString();
});
PayerEntitySchema.set('toJSON', { getters: true, virtuals: true });
PayerEntitySchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'PayerEntity';
const COLLECTION_NAME = 'payer_entities';
const PayerEntityModel = mongoose.model(MODEL_NAME, PayerEntitySchema, COLLECTION_NAME);
export { PayerEntitySchema, PayerEntityModel };
export default PayerEntityModel;
