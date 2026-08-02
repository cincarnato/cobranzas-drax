
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IMailboxUserSetting} from '../interfaces/IMailboxUserSetting'

const MailboxUserSettingSchema = new mongoose.Schema<IMailboxUserSetting>({
            mailbox: {type: mongoose.Schema.Types.ObjectId, ref: 'Mailbox',  required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            signatureHtml: {type: String,   required: false, index: false, unique: false },
            signatureText: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

MailboxUserSettingSchema.plugin(uniqueValidator, {message: 'validation.unique'});
MailboxUserSettingSchema.plugin(mongoosePaginate);

MailboxUserSettingSchema.virtual("id").get(function () {
    return this._id.toString();
});


MailboxUserSettingSchema.set('toJSON', {getters: true, virtuals: true});

MailboxUserSettingSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'MailboxUserSetting';
const COLLECTION_NAME = 'MailboxUserSetting';
const MailboxUserSettingModel = mongoose.model<IMailboxUserSetting, PaginateModel<IMailboxUserSetting>>(MODEL_NAME, MailboxUserSettingSchema,COLLECTION_NAME);

export {
    MailboxUserSettingSchema,
    MailboxUserSettingModel
}

export default MailboxUserSettingModel
