import {InboundEmailModel} from "../../modules/mail/models/InboundEmailModel.js";

const ASSIGNED_MANAGEMENT_INDEX = "mailbox_1_assignedTo_1_attentionStatus_1_assignmentMode_1_receivedAt_-1";
const LEGACY_ASSIGNED_INDEX = "mailbox_1_assignedTo_1_attentionStatus_1";

async function updateInboundEmailManagementIndexes() {
    const indexes = await InboundEmailModel.collection.listIndexes().toArray();
    const indexNames = new Set(indexes.map((index) => index.name).filter(Boolean));

    if (!indexNames.has(ASSIGNED_MANAGEMENT_INDEX)) {
        await InboundEmailModel.collection.createIndex(
            {mailbox: 1, assignedTo: 1, attentionStatus: 1, assignmentMode: 1, receivedAt: -1},
            {name: ASSIGNED_MANAGEMENT_INDEX},
        );
    }

    if (indexNames.has(LEGACY_ASSIGNED_INDEX)) {
        await InboundEmailModel.collection.dropIndex(LEGACY_ASSIGNED_INDEX);
    }
}

export default updateInboundEmailManagementIndexes;
export {updateInboundEmailManagementIndexes};
