import { mongoose } from '@drax/common-back';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';
const SessionEmailSchema = new mongoose.Schema({
    mailbox: { type: mongoose.Schema.Types.ObjectId, ref: 'Mailbox', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'CLOSED'], required: true, default: 'ACTIVE', index: true },
    startedAt: { type: Date, required: true, index: true },
    pausedAt: { type: Date, required: false, index: true },
    endedAt: { type: Date, required: false, index: true },
    lastActivityAt: { type: Date, required: false, index: true },
    maxAssignableEmails: { type: Number, required: true, default: 0 },
    assignedCount: { type: Number, required: true, default: 0 },
    repliedCount: { type: Number, required: true, default: 0 },
    closedCount: { type: Number, required: true, default: 0 },
    sessionRepliedInboundEmails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InboundEmail', required: false }],
    capacityFillLockedUntil: { type: Date, required: false, index: true },
}, { timestamps: true });
SessionEmailSchema.index({ mailbox: 1, user: 1, status: 1 });
SessionEmailSchema.index({ mailbox: 1, user: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['ACTIVE', 'PAUSED'] } } });
SessionEmailSchema.plugin(uniqueValidator, { message: 'validation.unique' });
SessionEmailSchema.plugin(mongoosePaginate);
SessionEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});
SessionEmailSchema.set('toJSON', { getters: true, virtuals: true });
SessionEmailSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'SessionEmail';
const COLLECTION_NAME = 'SessionEmail';
const SessionEmailModel = mongoose.model(MODEL_NAME, SessionEmailSchema, COLLECTION_NAME);
export { SessionEmailSchema, SessionEmailModel };
export default SessionEmailModel;
