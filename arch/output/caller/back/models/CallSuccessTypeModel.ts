
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICallSuccessType} from '../interfaces/ICallSuccessType'

const CallSuccessTypeSchema = new mongoose.Schema<ICallSuccessType>({
            name: {type: String,   required: false, index: false, unique: false },
            color: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

CallSuccessTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
CallSuccessTypeSchema.plugin(mongoosePaginate);

CallSuccessTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


CallSuccessTypeSchema.set('toJSON', {getters: true, virtuals: true});

CallSuccessTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'CallSuccessType';
const COLLECTION_NAME = 'CallSuccessType';
const CallSuccessTypeModel = mongoose.model<ICallSuccessType, PaginateModel<ICallSuccessType>>(MODEL_NAME, CallSuccessTypeSchema,COLLECTION_NAME);

export {
    CallSuccessTypeSchema,
    CallSuccessTypeModel
}

export default CallSuccessTypeModel
