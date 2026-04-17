import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const AffiliateSchema = new mongoose.Schema({
    apellidoNombre: { type: String, required: true, index: true, unique: false },
    dni: { type: String, required: true, index: true, unique: true },
    cuilCuit: { type: String, required: false, index: true, unique: false },
    tipo: { type: String, required: false, index: true, unique: false },
    titular: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: false, index: true, unique: false },
    titularDni: { type: String, required: true, index: true, unique: true }
}, { timestamps: true });
AffiliateSchema.plugin(uniqueValidator, { message: 'validation.unique' });
AffiliateSchema.plugin(mongoosePaginate);
AffiliateSchema.virtual("id").get(function () {
    return this._id.toString();
});
AffiliateSchema.set('toJSON', { getters: true, virtuals: true });
AffiliateSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'Affiliate';
const COLLECTION_NAME = 'Affiliate';
const AffiliateModel = mongoose.model(MODEL_NAME, AffiliateSchema, COLLECTION_NAME);
export { AffiliateSchema, AffiliateModel };
export default AffiliateModel;
