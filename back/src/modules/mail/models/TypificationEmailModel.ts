
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITypificationEmail} from '../interfaces/ITypificationEmail'

const TypificationEmailSchema = new mongoose.Schema<ITypificationEmail>({
            name: {type: String,   required: true, index: true, unique: true },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

TypificationEmailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TypificationEmailSchema.plugin(mongoosePaginate);

TypificationEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});


TypificationEmailSchema.set('toJSON', {getters: true, virtuals: true});

TypificationEmailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TypificationEmail';
const COLLECTION_NAME = 'TypificationEmail';
const TypificationEmailModel = mongoose.model<ITypificationEmail, PaginateModel<ITypificationEmail>>(MODEL_NAME, TypificationEmailSchema,COLLECTION_NAME);

export {
    TypificationEmailSchema,
    TypificationEmailModel
}

export default TypificationEmailModel
