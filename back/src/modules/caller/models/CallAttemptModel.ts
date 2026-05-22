import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICallAttempt} from '../interfaces/ICallAttempt'

const CallAttemptSchema = new mongoose.Schema<ICallAttempt>({
    date: {type: Date, required: false, index: true, unique: false, default: Date.now},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true, unique: false},
    result: {type: String, required: true, index: true, unique: false},
    callListName: {type: String, required: true, index: true, unique: false},
    callLogId: {type: String, required: true, index: true, unique: false},
    callLog: {type: mongoose.Schema.Types.ObjectId, ref: 'CallLog', required: true, index: true, unique: false}
}, {timestamps: true});

CallAttemptSchema.plugin(uniqueValidator, {message: 'validation.unique'});
CallAttemptSchema.plugin(mongoosePaginate);

CallAttemptSchema.virtual("id").get(function () {
    return this._id.toString();
});

CallAttemptSchema.set('toJSON', {getters: true, virtuals: true});

CallAttemptSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'CallAttempt';
const COLLECTION_NAME = 'CallAttempt';
const CallAttemptModel = mongoose.model<ICallAttempt, PaginateModel<ICallAttempt>>(MODEL_NAME, CallAttemptSchema, COLLECTION_NAME);

export {
    CallAttemptSchema,
    CallAttemptModel
}

export default CallAttemptModel
