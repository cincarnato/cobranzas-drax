import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const BonusSchema = new mongoose.Schema({
    dni: { type: String, required: true, index: false, unique: false },
    fullname: { type: String, required: true, index: false, unique: false },
    plan: { type: String, required: true, index: false, unique: false },
    appliedMonth: { type: String, required: true, index: false, unique: false },
    paymentMethod: { type: String, required: true, index: false, unique: false },
    bonus: { type: String, required: true, index: false, unique: false },
    period: { type: String, enum: ['1 Mes', '2 Meses', '3 Meses', '4 Meses', '5 Meses', '6 Meses'], required: false, index: false, unique: false },
    bonifiedNetValue: { type: Number, required: true, index: false, unique: false },
    status: { type: String, enum: ['Pendiente', 'Aplicado', 'No aplicado'], required: true, index: false, unique: false },
    observation: { type: String, required: false, index: false, unique: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: false, unique: false }
}, { timestamps: true });
BonusSchema.plugin(uniqueValidator, { message: 'validation.unique' });
BonusSchema.plugin(mongoosePaginate);
BonusSchema.virtual("id").get(function () {
    return this._id.toString();
});
BonusSchema.set('toJSON', { getters: true, virtuals: true });
BonusSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'Bonus';
const COLLECTION_NAME = 'bonuses';
const BonusModel = mongoose.model(MODEL_NAME, BonusSchema, COLLECTION_NAME);
export { BonusSchema, BonusModel };
export default BonusModel;
