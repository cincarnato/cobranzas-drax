import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITransferAuditSession} from "../interfaces/ITransferAuditSession";

const TransferAuditSessionSchema = new mongoose.Schema<ITransferAuditSession>({
    operator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    status: {type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED', 'CANCELLED'], required: true, default: 'ACTIVE', index: true},
    startedAt: {type: Date, required: true, index: true},
    pausedAt: {type: Date, required: false, index: true},
    completedAt: {type: Date, required: false, index: true},
    lastActivityAt: {type: Date, required: false, index: true},
    expiresAt: {type: Date, required: false, index: true},
    batchSize: {type: Number, required: true, default: 5},
    assignedCount: {type: Number, required: true, default: 0},
    auditedCount: {type: Number, required: true, default: 0},
    validatedCount: {type: Number, required: true, default: 0},
    correctedCount: {type: Number, required: true, default: 0},
    discardedCount: {type: Number, required: true, default: 0},
    referredCount: {type: Number, required: true, default: 0},
}, {timestamps: true});

TransferAuditSessionSchema.plugin(mongoosePaginate);

TransferAuditSessionSchema.virtual("id").get(function () {
    return this._id.toString();
});

TransferAuditSessionSchema.set('toJSON', {getters: true, virtuals: true});
TransferAuditSessionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TransferAuditSession';
const COLLECTION_NAME = 'TransferAuditSession';
const TransferAuditSessionModel = mongoose.model<ITransferAuditSession, PaginateModel<ITransferAuditSession>>(MODEL_NAME, TransferAuditSessionSchema, COLLECTION_NAME);

export {
    TransferAuditSessionSchema,
    TransferAuditSessionModel
}

export default TransferAuditSessionModel
