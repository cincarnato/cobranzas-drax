
import {AbstractMongoRepository} from "@drax/crud-back";
import {TransferEmailModel} from "../../models/TransferEmailModel.js";
import type {ITransferEmailRepository} from '../../interfaces/ITransferEmailRepository'
import type {ITransferEmail, ITransferEmailBase} from "../../interfaces/ITransferEmail";
import {mongoose} from "@drax/common-back";


class TransferEmailMongoRepository extends AbstractMongoRepository<ITransferEmail, ITransferEmailBase, ITransferEmailBase> implements ITransferEmailRepository {

    constructor() {
        super();
        this._model = TransferEmailModel;
        this._searchFields = ['affiliateStrategy', 'affiliates.name', 'affiliates.documentNumber', 'emailMessageId', 'emailSubject', 'emailFromName', 'emailFromEmail', 'emailDocumentNumber', 'originName'];
        this._populateFields = ['inboundEmail', 'payer', 'assignedTo', 'auditedBy'];
        this._lean = true
    }

    async assignNextAvailable(operatorId: string, sessionId: string, assignedAt: Date, expiresAt: Date): Promise<ITransferEmail | null> {
        return await TransferEmailModel.findOneAndUpdate(
            {
                status: 'PENDIENTE_AUDITORIA',
                humanStatus: 'PENDIENTE',
                $or: [
                    {assignedTo: {$exists: false}},
                    {assignedTo: null},
                    {assignmentExpiresAt: {$lte: assignedAt}},
                ],
            },
            {
                $set: {
                    assignedTo: new mongoose.Types.ObjectId(operatorId),
                    auditSessionId: new mongoose.Types.ObjectId(sessionId),
                    assignedAt,
                    assignmentExpiresAt: expiresAt,
                    lastActivityAt: assignedAt,
                },
            },
            {new: true, sort: {emailDate: 1, createdAt: 1}}
        ).populate(this._populateFields).lean() as ITransferEmail | null
    }

    async findAssignedToSession(sessionId: string): Promise<ITransferEmail[]> {
        return await TransferEmailModel.find({auditSessionId: sessionId})
            .sort({createdAt: 1, emailDate: 1})
            .populate(this._populateFields)
            .lean() as ITransferEmail[]
    }

    async releasePendingAssignments(sessionId: string, operatorId: string): Promise<number> {
        const result = await TransferEmailModel.updateMany(
            {
                auditSessionId: sessionId,
                assignedTo: operatorId,
                status: 'PENDIENTE_AUDITORIA',
                humanStatus: 'PENDIENTE',
            },
            {
                $unset: {
                    assignedTo: '',
                    auditSessionId: '',
                    assignedAt: '',
                    assignmentExpiresAt: '',
                    lastActivityAt: '',
                },
            }
        )

        return result.modifiedCount
    }

    async renewAssignments(sessionId: string, operatorId: string, lastActivityAt: Date, expiresAt: Date): Promise<number> {
        const result = await TransferEmailModel.updateMany(
            {
                auditSessionId: sessionId,
                assignedTo: operatorId,
                status: 'PENDIENTE_AUDITORIA',
                humanStatus: 'PENDIENTE',
                assignmentExpiresAt: {$gt: lastActivityAt},
            },
            {
                $set: {
                    lastActivityAt,
                    assignmentExpiresAt: expiresAt,
                },
            }
        )

        return result.modifiedCount
    }

    async auditAssigned(id: string, operatorId: string, sessionId: string, now: Date, payload: Partial<ITransferEmailBase>): Promise<ITransferEmail | null> {
        return await TransferEmailModel.findOneAndUpdate(
            {
                _id: id,
                assignedTo: operatorId,
                auditSessionId: sessionId,
                assignmentExpiresAt: {$gt: now},
            },
            {
                $set: payload,
                $unset: {
                    assignedTo: '',
                    assignedAt: '',
                    assignmentExpiresAt: '',
                    lastActivityAt: '',
                },
            },
            {new: true}
        ).populate(this._populateFields).lean() as ITransferEmail | null
    }

}

export default TransferEmailMongoRepository
export {TransferEmailMongoRepository}
