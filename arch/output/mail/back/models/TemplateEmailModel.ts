
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITemplateEmail} from '../interfaces/ITemplateEmail'

const TemplateEmailSchema = new mongoose.Schema<ITemplateEmail>({
            mailbox: {type: mongoose.Schema.Types.ObjectId, ref: 'Mailbox',  required: true, index: true, unique: false },
            name: {type: String,   required: true, index: true, unique: false },
            content: {type: String,   required: true, index: false, unique: false }
}, {timestamps: true});

TemplateEmailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TemplateEmailSchema.plugin(mongoosePaginate);

TemplateEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});


TemplateEmailSchema.set('toJSON', {getters: true, virtuals: true});

TemplateEmailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TemplateEmail';
const COLLECTION_NAME = 'TemplateEmail';
const TemplateEmailModel = mongoose.model<ITemplateEmail, PaginateModel<ITemplateEmail>>(MODEL_NAME, TemplateEmailSchema,COLLECTION_NAME);

export {
    TemplateEmailSchema,
    TemplateEmailModel
}

export default TemplateEmailModel
