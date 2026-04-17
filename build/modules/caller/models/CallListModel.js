import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const CallListSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupZone', required: false, index: false, unique: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: false, unique: false },
    file: {
        filename: { type: String, required: false, index: false, unique: false },
        filepath: { type: String, required: false, index: false, unique: false },
        size: { type: Number, required: false, index: false, unique: false },
        mimetype: { type: String, required: false, index: false, unique: false },
        url: { type: String, required: false, index: false, unique: false },
    },
    state: {
        type: String,
        enum: ['PREPARANDO', 'EN_CURSO', 'ARCHIVADO', 'FINALIZADO', 'VENCIDO'],
        required: false,
        index: false,
        unique: false
    },
    total: { type: Number, required: false, index: false, unique: false },
    attempts: { type: Number, required: false, index: false, unique: false },
    attemptsControl: [{
            number: { type: Number, required: false, index: false, unique: false },
            count: { type: Number, required: false, index: false, unique: false },
            success: { type: Number, required: false, index: false, unique: false },
            promises: { type: Number, required: false, index: false, unique: false }
        }],
    success: { type: Number, required: false, index: false, unique: false },
    promises: { type: Number, required: false, index: false, unique: false },
    failed: { type: Number, required: false, index: false, unique: false },
    isExportable: { type: Boolean, required: false, index: false, unique: false, default: false },
    deadline: { type: Date, required: false, index: false, unique: false },
    name: { type: String, required: true, index: true, unique: true },
    headers: [{ type: String, required: false, index: false, unique: false }]
}, { timestamps: true });
CallListSchema.plugin(uniqueValidator, { message: 'validation.unique' });
CallListSchema.plugin(mongoosePaginate);
CallListSchema.virtual("id").get(function () {
    return this._id.toString();
});
CallListSchema.set('toJSON', { getters: true, virtuals: true });
CallListSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'CallList';
const COLLECTION_NAME = 'CallList';
const CallListModel = mongoose.model(MODEL_NAME, CallListSchema, COLLECTION_NAME);
export { CallListSchema, CallListModel };
export default CallListModel;
