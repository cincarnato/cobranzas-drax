
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IInboundEmail} from '../interfaces/IInboundEmail'

const InboundEmailSchema = new mongoose.Schema<IInboundEmail>({
            messageId: {type: String,   required: true, index: true, unique: true },
            threadId: {type: String,   required: false, index: true, unique: false },
            mailbox: {type: String,   required: false, index: false, unique: false },
            sourceChannel: {type: String,  enum: ['EMAIL', 'FORWARDED_EMAIL', 'MANUAL_UPLOAD', 'API'], required: true, index: false, unique: false },
            receivedAt: {type: Date,   required: true, index: true, unique: false },
            subject: {type: String,   required: false, index: true, unique: false },
            fromName: {type: String,   required: false, index: false, unique: false },
            fromEmail: {type: String,   required: false, index: true, unique: false },
            toEmails: [{type: String,   required: false, index: false, unique: false }],
            ccEmails: [{type: String,   required: false, index: false, unique: false }],
            replyToEmail: {type: String,   required: false, index: false, unique: false },
            bodyText: {type: String,   required: false, index: false, unique: false },
            bodyHtml: {type: String,   required: false, index: false, unique: false },
            normalizedText: {type: String,   required: false, index: false, unique: false },
            hasAttachments: {type: Boolean,   required: false, index: false, unique: false },
            attachmentCount: {type: Number,   required: false, index: false, unique: false },
            attachments: [{ 
            {
        filename: {type: String ,  required: false, index: false, unique: false },
        filepath: {type: String ,  required: false, index: false, unique: false },
        size: {type: Number ,  required: false, index: false, unique: false },
        mimetype: {type: String ,  required: false, index: false, unique: false },
        url: {type: String ,  required: false, index: false, unique: false },
        } 
            }],
            category: {type: String,   required: false, index: true, unique: false },
            sentiment: {type: String,  enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'], required: false, index: false, unique: false },
            urgency: {type: String,  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: false, index: false, unique: false },
            summary: {type: String,   required: false, index: false, unique: false },
            tags: [{type: String,   required: false, index: false, unique: false }],
            aiModel: {type: String,   required: false, index: false, unique: false },
            extractedData: {
            affiliateName: {type: String,   required: false, index: false, unique: false },
            affiliateDocumentNumber: {type: String,   required: false, index: true, unique: false },
            affiliateCuil: {type: String,   required: false, index: true, unique: false },
            affiliateEmail: {type: String,   required: false, index: false, unique: false },
            affiliatePhone: {type: String,   required: false, index: false, unique: false },
            affiliate: {type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate',  required: false, index: false, unique: false },
            extractedEntities: [{ 
                        label: {type: String,   required: true, index: false, unique: false },
            value: {type: String,   required: false, index: false, unique: false },
            source: {type: String,  enum: ['SUBJECT', 'BODY', 'ATTACHMENT', 'MANUAL'], required: false, index: false, unique: false },
            confidence: {type: Number,   required: false, index: false, unique: false } 
            }] 
            },
            processingStatus: {type: String,  enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'REVIEW_REQUIRED', 'REJECTED', 'ERROR'], required: true, index: true, unique: false },
            reviewStatus: {type: String,  enum: ['PENDING', 'APPROVED', 'REJECTED', 'CORRECTED'], required: false, index: false, unique: false },
            needsHumanReview: {type: Boolean,   required: false, index: false, unique: false },
            autoApproved: {type: Boolean,   required: false, index: false, unique: false },
            isDuplicate: {type: Boolean,   required: false, index: false, unique: false },
            duplicateOfMessageId: {type: String,   required: false, index: true, unique: false },
            rejectionReason: {type: String,   required: false, index: false, unique: false },
            validationNotes: {type: String,   required: false, index: false, unique: false },
            rawExtractionJson: {type: String,   required: false, index: false, unique: false },
            processedAt: {type: Date,   required: false, index: false, unique: false },
            lastErrorAt: {type: Date,   required: false, index: false, unique: false },
            lastErrorMessage: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

InboundEmailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
InboundEmailSchema.plugin(mongoosePaginate);

InboundEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});


InboundEmailSchema.set('toJSON', {getters: true, virtuals: true});

InboundEmailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'InboundEmail';
const COLLECTION_NAME = 'InboundEmail';
const InboundEmailModel = mongoose.model<IInboundEmail, PaginateModel<IInboundEmail>>(MODEL_NAME, InboundEmailSchema,COLLECTION_NAME);

export {
    InboundEmailSchema,
    InboundEmailModel
}

export default InboundEmailModel
