
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITransferEmail} from '../interfaces/ITransferEmail'

const TransferEmailSchema = new mongoose.Schema<ITransferEmail>({
            inboundEmail: {type: mongoose.Schema.Types.ObjectId, ref: 'InboundEmail',  required: false, index: false, unique: false },
            emailMessageId: {type: String,   required: false, index: true, unique: false },
            emailSubject: {type: String,   required: false, index: true, unique: false },
            emailFromName: {type: String,   required: false, index: true, unique: false },
            emailFromEmail: {type: String,   required: false, index: true, unique: false },
            emailDocumentNumber: {type: String,   required: false, index: true, unique: false },
            isTransferProof: {type: Boolean,   required: false, index: false, unique: false },
            amount: {type: Number,   required: false, index: false, unique: false },
            currency: {type: String,  enum: ['ARS', 'USD', 'EUR', 'OTHER'], required: false, index: false, unique: false },
            transferDate: {type: Date,   required: false, index: false, unique: false },
            emailDate: {type: Date,   required: false, index: true, unique: false },
            processDate: {type: Date,   required: false, index: true, unique: false },
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
            affiliateStrategy: {type: String,  enum: ['EMAIL_FROM', 'DNI_CUIL', 'CBU_CVU', 'NRO_CUENTA', 'EMAIL_DATA'], required: false, index: true, unique: false },
            affiliates: [{
                name: {type: String, required: false},
                amount: {type: Number, required: false},
                documentNumber: {type: String, required: false},
                month: {type: String, required: false},
                observations: {type: String, required: false}
            }],
            aiStatus: {type: String, enum: ['PENDIENTE', 'PROCESADO_CONFIABLE', 'PROCESADO_CON_DUDAS', 'PROCESADO_INCOMPLETO', 'ERROR_PROCESAMIENTO'], required: true, default: 'PENDIENTE', index: true, unique: false },
            aiProcessedAt: {type: Date, required: false, index: true, unique: false },
            aiError: {type: String, required: false, index: false, unique: false },
            humanStatus: {type: String, enum: ['PENDIENTE', 'VALIDADO', 'CORREGIDO', 'DESCARTADO'], required: true, default: 'PENDIENTE', index: true, unique: false },
            assignedTo: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true, unique: false },
            auditedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true, unique: false },
            auditedAt: {type: Date, required: false, index: true, unique: false },
            status: {type: String, enum: ['PENDIENTE_IA', 'PENDIENTE_AUDITORIA', 'AUDITADO'], required: true, default: 'PENDIENTE_IA', index: true, unique: false },
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
