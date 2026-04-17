
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITransferEmail} from '../interfaces/ITransferEmail'

const TransferEmailSchema = new mongoose.Schema<ITransferEmail>({
            inboundEmail: {type: mongoose.Schema.Types.ObjectId, ref: 'InboundEmail',  required: false, index: false, unique: false },
            isTransferProof: {type: Boolean,   required: false, index: false, unique: false },
            amount: {type: Number,   required: false, index: false, unique: false },
            currency: {type: String,  enum: ['ARS', 'USD', 'EUR', 'OTHER'], required: false, index: false, unique: false },
            transferDate: {type: Date,   required: false, index: false, unique: false },
            operationNumber: {type: String,   required: false, index: true, unique: false },
            concept: {type: String,   required: false, index: false, unique: false },
            originAccount: {type: String,   required: false, index: true, unique: false },
            originCbu: {type: String,   required: false, index: true, unique: false },
            originAlias: {type: String,   required: false, index: false, unique: false },
            originBank: {type: String,   required: false, index: false, unique: false },
            destinationAccount: {type: String,   required: false, index: true, unique: false },
            destinationCbu: {type: String,   required: false, index: true, unique: false },
            destinationAlias: {type: String,   required: false, index: false, unique: false },
            destinationBank: {type: String,   required: false, index: false, unique: false },
            affiliateName: {type: String,   required: false, index: false, unique: false },
            affiliateEmail: {type: String,   required: false, index: false, unique: false },
            affiliateDocumentNumber: {type: String,   required: false, index: false, unique: false },
            needsHumanReview: {type: Boolean,   required: false, index: false, unique: false }
}, {timestamps: true});

TransferEmailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TransferEmailSchema.plugin(mongoosePaginate);

TransferEmailSchema.virtual("id").get(function () {
    return this._id.toString();
});


TransferEmailSchema.set('toJSON', {getters: true, virtuals: true});

TransferEmailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TransferEmail';
const COLLECTION_NAME = 'TransferEmail';
const TransferEmailModel = mongoose.model<ITransferEmail, PaginateModel<ITransferEmail>>(MODEL_NAME, TransferEmailSchema,COLLECTION_NAME);

export {
    TransferEmailSchema,
    TransferEmailModel
}

export default TransferEmailModel
