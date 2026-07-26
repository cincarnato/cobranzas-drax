
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IOutboundEmail} from '../interfaces/IOutboundEmail'

const OutboundEmailSchema = new mongoose.Schema<IOutboundEmail>({
            inboundEmail: {type: mongoose.Schema.Types.ObjectId, ref: 'InboundEmail',  required: false, index: true, unique: false },
            mailbox: {type: mongoose.Schema.Types.ObjectId, ref: 'Mailbox',  required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: true, unique: false },
            fromEmail: {type: String,   required: true, index: true, unique: false },
            toEmails: [{type: String,   required: true, index: false, unique: false }],
            ccEmails: [{type: String,   required: false, index: false, unique: false }],
            bccEmails: [{type: String,   required: false, index: false, unique: false }],
            subject: {type: String,   required: true, index: true, unique: false },
            bodyText: {type: String,   required: false, index: false, unique: false },
            bodyHtml: {type: String,   required: false, index: false, unique: false },
            attachments: [{
                filename: {type: String, required: false},
                filepath: {type: String, required: false},
                size: {type: Number, required: false},
                mimetype: {type: String, required: false},
                url: {type: String, required: false},
            }],
            status: {type: String,  enum: ['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED'], required: true, index: true, unique: false, default: 'DRAFT' },
            messageId: {type: String,   required: false, index: true, unique: false },
            inReplyTo: {type: String,   required: false, index: true, unique: false },
            references: [{type: String,   required: false, index: false, unique: false }],
            sentAt: {type: Date,   required: false, index: true, unique: false },
            lastError: {type: String,   required: false, index: false, unique: false },
            attempts: {type: Number,   required: false, index: false, unique: false, default: 0 }
}, {timestamps: true});

OutboundEmailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
OutboundEmailSchema.plugin(mongoosePaginate);

OutboundEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});


OutboundEmailSchema.set('toJSON', {getters: true, virtuals: true});

OutboundEmailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'OutboundEmail';
const COLLECTION_NAME = 'OutboundEmail';
const OutboundEmailModel = mongoose.model<IOutboundEmail, PaginateModel<IOutboundEmail>>(MODEL_NAME, OutboundEmailSchema,COLLECTION_NAME);

export {
    OutboundEmailSchema,
    OutboundEmailModel
}

export default OutboundEmailModel
