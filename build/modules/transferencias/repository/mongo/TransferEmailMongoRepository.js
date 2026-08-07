import { AbstractMongoRepository } from "@drax/crud-back";
import { TransferEmailModel } from "../../models/TransferEmailModel.js";
import { mongoose } from "@drax/common-back";
class TransferEmailMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = TransferEmailModel;
        this._searchFields = ['affiliateStrategy', 'affiliates.name', 'affiliates.documentNumber', 'emailMessageId', 'emailSubject', 'emailFromName', 'emailFromEmail', 'emailDocumentNumber', 'originName'];
        this._populateFields = ['inboundEmail', 'payer', 'assignedTo', 'auditedBy'];
        this._lean = true;
    }
    async assignNextAvailable(operatorId, sessionId, assignedAt, expiresAt) {
        return await TransferEmailModel.findOneAndUpdate({
            status: 'PENDIENTE_AUDITORIA',
            humanStatus: 'PENDIENTE',
            $or: [
                { assignedTo: { $exists: false } },
                { assignedTo: null },
                { assignmentExpiresAt: { $lte: assignedAt } },
            ],
        }, {
            $set: {
                assignedTo: new mongoose.Types.ObjectId(operatorId),
                auditSessionId: new mongoose.Types.ObjectId(sessionId),
                assignedAt,
                assignmentExpiresAt: expiresAt,
                lastActivityAt: assignedAt,
            },
        }, { new: true, sort: { emailDate: 1, createdAt: 1 } }).populate(this._populateFields).lean();
    }
    async findAssignedToSession(sessionId) {
        return await TransferEmailModel.find({ auditSessionId: sessionId })
            .sort({ createdAt: 1, emailDate: 1 })
            .populate(this._populateFields)
            .lean();
    }
    async releasePendingAssignments(sessionId, operatorId) {
        const result = await TransferEmailModel.updateMany({
            auditSessionId: sessionId,
            assignedTo: operatorId,
            status: 'PENDIENTE_AUDITORIA',
            humanStatus: 'PENDIENTE',
        }, {
            $unset: {
                assignedTo: '',
                auditSessionId: '',
                assignedAt: '',
                assignmentExpiresAt: '',
                lastActivityAt: '',
            },
        });
        return result.modifiedCount;
    }
    async renewAssignments(sessionId, operatorId, lastActivityAt, expiresAt) {
        const result = await TransferEmailModel.updateMany({
            auditSessionId: sessionId,
            assignedTo: operatorId,
            status: 'PENDIENTE_AUDITORIA',
            humanStatus: 'PENDIENTE',
            assignmentExpiresAt: { $gt: lastActivityAt },
        }, {
            $set: {
                lastActivityAt,
                assignmentExpiresAt: expiresAt,
            },
        });
        return result.modifiedCount;
    }
    async auditAssigned(id, operatorId, sessionId, now, payload) {
        return await TransferEmailModel.findOneAndUpdate({
            _id: id,
            assignedTo: operatorId,
            auditSessionId: sessionId,
            assignmentExpiresAt: { $gt: now },
        }, {
            $set: payload,
            $unset: {
                assignedTo: '',
                assignedAt: '',
                assignmentExpiresAt: '',
                lastActivityAt: '',
            },
        }, { new: true }).populate(this._populateFields).lean();
    }
}
export default TransferEmailMongoRepository;
export { TransferEmailMongoRepository };
