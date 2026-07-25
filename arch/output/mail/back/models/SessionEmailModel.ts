
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ISessionEmail} from '../interfaces/ISessionEmail'

const SessionEmailSchema = new mongoose.Schema<ISessionEmail>({
            mailbox: {type: mongoose.Schema.Types.ObjectId, ref: 'Mailbox',  required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            status: {type: String,  enum: ['ACTIVE', 'PAUSED', 'CLOSED'], required: true, index: true, unique: false },
            startedAt: {type: Date,   required: true, index: true, unique: false },
            pausedAt: {type: Date,   required: false, index: true, unique: false },
            endedAt: {type: Date,   required: false, index: true, unique: false },
            lastActivityAt: {type: Date,   required: false, index: true, unique: false },
            maxAssignableEmails: {type: Number,   required: true, index: false, unique: false },
            assignedCount: {type: Number,   required: true, index: false, unique: false },
            repliedCount: {type: Number,   required: true, index: false, unique: false },
            closedCount: {type: Number,   required: true, index: false, unique: false },
            capacityFillLockedUntil: {type: Date,   required: false, index: true, unique: false }
}, {timestamps: true});

SessionEmailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
SessionEmailSchema.plugin(mongoosePaginate);

SessionEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});


SessionEmailSchema.set('toJSON', {getters: true, virtuals: true});

SessionEmailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'SessionEmail';
const COLLECTION_NAME = 'SessionEmail';
const SessionEmailModel = mongoose.model<ISessionEmail, PaginateModel<ISessionEmail>>(MODEL_NAME, SessionEmailSchema,COLLECTION_NAME);

export {
    SessionEmailSchema,
    SessionEmailModel
}

export default SessionEmailModel
