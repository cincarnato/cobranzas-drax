
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IWhatsappMessage} from '../interfaces/IWhatsappMessage'

const WhatsappMessageSchema = new mongoose.Schema<IWhatsappMessage>({
            sentAt: {type: Date,   required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            destinationNumber: {type: String,   required: true, index: true, unique: false },
            template: {type: String,   required: true, index: true, unique: false }
}, {timestamps: true});

WhatsappMessageSchema.plugin(uniqueValidator, {message: 'validation.unique'});
WhatsappMessageSchema.plugin(mongoosePaginate);

WhatsappMessageSchema.virtual("id").get(function () {
    return this._id.toString();
});


WhatsappMessageSchema.set('toJSON', {getters: true, virtuals: true});

WhatsappMessageSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'WhatsappMessage';
const COLLECTION_NAME = 'WhatsappMessage';
const WhatsappMessageModel = mongoose.model<IWhatsappMessage, PaginateModel<IWhatsappMessage>>(MODEL_NAME, WhatsappMessageSchema,COLLECTION_NAME);

export {
    WhatsappMessageSchema,
    WhatsappMessageModel
}

export default WhatsappMessageModel
