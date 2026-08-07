import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const MailboxUserSettingSchema = new mongoose.Schema({
    mailbox: { type: mongoose.Schema.Types.ObjectId, ref: 'Mailbox', required: true, index: true, unique: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: false },
    signatureHtml: { type: String, required: false, index: false, unique: false },
    signatureText: { type: String, required: false, index: false, unique: false },
    autoAdvanceOnClose: { type: Boolean, required: false, index: false, unique: false, default: false }
}, { timestamps: true });
MailboxUserSettingSchema.index({ mailbox: 1, user: 1 }, { unique: true });
MailboxUserSettingSchema.plugin(uniqueValidator, { message: 'validation.unique' });
MailboxUserSettingSchema.plugin(mongoosePaginate);
MailboxUserSettingSchema.virtual("id").get(function () {
    return this._id.toString();
});
MailboxUserSettingSchema.set('toJSON', { getters: true, virtuals: true });
MailboxUserSettingSchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'MailboxUserSetting';
const COLLECTION_NAME = 'MailboxUserSetting';
const MailboxUserSettingModel = mongoose.model(MODEL_NAME, MailboxUserSettingSchema, COLLECTION_NAME);
export { MailboxUserSettingSchema, MailboxUserSettingModel };
export default MailboxUserSettingModel;
