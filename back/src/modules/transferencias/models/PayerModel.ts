
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPayer} from '../interfaces/IPayer'

const PayerSchema = new mongoose.Schema<IPayer>({
    strategy: {
        type: String,
        enum: ['EMAIL', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA'],
        required: true,
        index: true
    },
    value: {
        type: String,
        required: true,
        index: true
    },
    affiliateName: {
        type: String,
        required: false,
        index: true
    },
    affiliateEmail: {
        type: String,
        required: false,
        index: true
    },
    affiliateDocumentNumber: {
        type: String,
        required: false,
        index: true
    },
    additionalAffiliates: [{
        name: {type: String, required: false},
        email: {type: String, required: false},
        documentNumber: {type: String, required: false}
    }]
}, {timestamps: true});

PayerSchema.plugin(uniqueValidator, {message: 'validation.unique'});
PayerSchema.plugin(mongoosePaginate);

PayerSchema.virtual("id").get(function () {
    return this._id.toString();
});


PayerSchema.set('toJSON', {getters: true, virtuals: true});

PayerSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Payer';
const COLLECTION_NAME = 'payers';
const PayerModel = mongoose.model<IPayer, PaginateModel<IPayer>>(MODEL_NAME, PayerSchema,COLLECTION_NAME);

export {
    PayerSchema,
    PayerModel
}

export default PayerModel
