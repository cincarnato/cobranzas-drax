
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IMailbox} from '../interfaces/IMailbox'

const MailboxSchema = new mongoose.Schema<IMailbox>({
            name: {type: String,   required: true, index: true, unique: true },
            email: {type: String,   required: true, index: true, unique: true },
            username: {type: String,   required: true, index: false, unique: false },
            password: {type: String,   required: true, index: false, unique: false },
            categories: [{
                name: {type: String, required: true, index: false, unique: false},
                description: {type: String, required: false, index: false, unique: false}
            }],
            entities: [{
                name: {type: String, required: true, index: false, unique: false},
                description: {type: String, required: false, index: false, unique: false}
            }],
            sentiments: [{type: String, required: false}],
            priorities: [{type: String, required: false}],
            tags: [{type: String, required: false}],
            isActive: {type: Boolean,   required: false, index: false, unique: false },
            autoProcessEnabled: {type: Boolean,   required: false, index: false, unique: false },
            attachmentStorageEnabled: {type: Boolean,   required: false, index: false, unique: false, default: true },
            attachmentOcrEnabled: {type: Boolean,   required: false, index: false, unique: false, default: false },
            processingProtocol: {type: String,  enum: ['IMAP', 'POP'], required: false, index: false, unique: false },
            processingIntervalMinutes: {type: Number,   required: false, index: false, unique: false },
            imapEnabled: {type: Boolean,   required: false, index: false, unique: false },
            imapHost: {type: String,   required: false, index: false, unique: false },
            imapPort: {type: Number,   required: false, index: false, unique: false },
            imapTls: {type: Boolean,   required: false, index: false, unique: false },
            popEnabled: {type: Boolean,   required: false, index: false, unique: false },
            popHost: {type: String,   required: false, index: false, unique: false },
            popPort: {type: Number,   required: false, index: false, unique: false },
            popTls: {type: Boolean,   required: false, index: false, unique: false },
            smtpEnabled: {type: Boolean,   required: false, index: false, unique: false },
            smtpHost: {type: String,   required: false, index: false, unique: false },
            smtpPort: {type: Number,   required: false, index: false, unique: false },
            smtpTls: {type: Boolean,   required: false, index: false, unique: false }
}, {timestamps: true});

MailboxSchema.plugin(uniqueValidator, {message: 'validation.unique'});
MailboxSchema.plugin(mongoosePaginate);

MailboxSchema.virtual("id").get(function () {
    return this._id.toString();
});


MailboxSchema.set('toJSON', {getters: true, virtuals: true});

MailboxSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Mailbox';
const COLLECTION_NAME = 'Mailbox';
const MailboxModel = mongoose.model<IMailbox, PaginateModel<IMailbox>>(MODEL_NAME, MailboxSchema,COLLECTION_NAME);

export {
    MailboxSchema,
    MailboxModel
}

export default MailboxModel
