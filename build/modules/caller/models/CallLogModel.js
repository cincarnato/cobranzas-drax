import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const CallLogSchema = new mongoose.Schema({
    callList: { type: mongoose.Schema.Types.ObjectId, ref: 'CallList', required: true, index: true, unique: false },
    attempts: { type: Number, required: false, index: false, unique: false },
    notes: { type: String, required: false, index: false, unique: false },
    typification: { type: String, required: false, index: false, unique: false },
    state: { type: String, enum: ['pendiente', 'intentada', 'fallida', 'promesa', 'exitosa'], required: false, index: false, unique: false },
    promiseDate: { type: Date, required: false, index: false, unique: false },
    done: { type: Boolean, default: false, required: false, index: false, unique: false },
    data: { type: mongoose.Schema.Types.Mixed, required: false, index: false, unique: false }
}, { timestamps: true });
CallLogSchema.plugin(uniqueValidator, { message: 'validation.unique' });
CallLogSchema.plugin(mongoosePaginate);
CallLogSchema.virtual("id").get(function () {
    return this._id.toString();
});
CallLogSchema.set('toJSON', { getters: true, virtuals: true });
CallLogSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'CallLog';
const COLLECTION_NAME = 'CallLog';
const CallLogModel = mongoose.model(MODEL_NAME, CallLogSchema, COLLECTION_NAME);
export { CallLogSchema, CallLogModel };
export default CallLogModel;
