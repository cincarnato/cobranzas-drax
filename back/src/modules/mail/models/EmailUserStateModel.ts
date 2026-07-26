import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IEmailUserState} from '../interfaces/IEmailUserState'

const EmailUserStateSchema = new mongoose.Schema<IEmailUserState>({
    inboundEmail: {type: mongoose.Schema.Types.ObjectId, ref: 'InboundEmail', required: true, index: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    isRead: {type: Boolean, required: false, default: false},
    readAt: {type: Date, required: false},
    isStarred: {type: Boolean, required: false, default: false},
}, {timestamps: true});

EmailUserStateSchema.index({inboundEmail: 1, user: 1}, {unique: true});
EmailUserStateSchema.plugin(mongoosePaginate);
EmailUserStateSchema.virtual("id").get(function () {
    return this._id.toString();
});
EmailUserStateSchema.set('toJSON', {getters: true, virtuals: true});
EmailUserStateSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'EmailUserState';
const COLLECTION_NAME = 'EmailUserState';
const EmailUserStateModel = mongoose.model<IEmailUserState, PaginateModel<IEmailUserState>>(MODEL_NAME, EmailUserStateSchema, COLLECTION_NAME);

export {EmailUserStateSchema, EmailUserStateModel}
export default EmailUserStateModel
