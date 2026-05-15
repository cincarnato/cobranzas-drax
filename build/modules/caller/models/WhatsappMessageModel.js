import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const WhatsappMessageSchema = new mongoose.Schema({
    sentAt: { type: Date, required: true, index: true, unique: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: false },
    destinationNumber: { type: String, required: true, index: true, unique: false },
    template: { type: String, required: true, index: true, unique: false }
}, { timestamps: true });
WhatsappMessageSchema.plugin(uniqueValidator, { message: 'validation.unique' });
WhatsappMessageSchema.plugin(mongoosePaginate);
WhatsappMessageSchema.virtual("id").get(function () {
    return this._id.toString();
});
WhatsappMessageSchema.set('toJSON', { getters: true, virtuals: true });
WhatsappMessageSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'WhatsappMessage';
const COLLECTION_NAME = 'WhatsappMessage';
const WhatsappMessageModel = mongoose.model(MODEL_NAME, WhatsappMessageSchema, COLLECTION_NAME);
export { WhatsappMessageSchema, WhatsappMessageModel };
export default WhatsappMessageModel;
