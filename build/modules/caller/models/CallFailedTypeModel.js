import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const CallFailedTypeSchema = new mongoose.Schema({
    name: { type: String, required: false, index: false, unique: false },
    color: { type: String, required: false, index: false, unique: false }
}, { timestamps: true });
CallFailedTypeSchema.plugin(uniqueValidator, { message: 'validation.unique' });
CallFailedTypeSchema.plugin(mongoosePaginate);
CallFailedTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});
CallFailedTypeSchema.set('toJSON', { getters: true, virtuals: true });
CallFailedTypeSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'CallFailedType';
const COLLECTION_NAME = 'CallFailedType';
const CallFailedTypeModel = mongoose.model(MODEL_NAME, CallFailedTypeSchema, COLLECTION_NAME);
export { CallFailedTypeSchema, CallFailedTypeModel };
export default CallFailedTypeModel;
