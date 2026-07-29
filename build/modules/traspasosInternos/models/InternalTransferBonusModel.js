import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const InternalTransferBonusSchema = new mongoose.Schema({
    dni: { type: String, required: true, index: false, unique: false },
    fullname: { type: String, required: true, index: false, unique: false },
    appliedMonth: { type: String, required: true, index: false, unique: false },
    bonifiedValue: { type: Number, required: true, index: false, unique: false },
    bonusType: { type: String, enum: ['Crédito en Cuenta Corriente', 'Transferencia Bancaria'], required: true, index: false, unique: false },
    bankDataAttachment: {
        filename: { type: String, required: false, index: false, unique: false },
        filepath: { type: String, required: false, index: false, unique: false },
        size: { type: Number, required: false, index: false, unique: false },
        mimetype: { type: String, required: false, index: false, unique: false },
        url: { type: String, required: false, index: false, unique: false },
    },
    status: { type: String, enum: ['Pendiente', 'Aplicado', 'No aplicado'], required: true, index: false, unique: false },
    observation: { type: String, required: false, index: false, unique: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: false, unique: false }
}, { timestamps: true });
InternalTransferBonusSchema.plugin(uniqueValidator, { message: 'validation.unique' });
InternalTransferBonusSchema.plugin(mongoosePaginate);
InternalTransferBonusSchema.virtual("id").get(function () {
    return this._id.toString();
});
InternalTransferBonusSchema.set('toJSON', { getters: true, virtuals: true });
InternalTransferBonusSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'InternalTransferBonus';
const COLLECTION_NAME = 'internalTransferBonuses';
const InternalTransferBonusModel = mongoose.model(MODEL_NAME, InternalTransferBonusSchema, COLLECTION_NAME);
export { InternalTransferBonusSchema, InternalTransferBonusModel };
export default InternalTransferBonusModel;
