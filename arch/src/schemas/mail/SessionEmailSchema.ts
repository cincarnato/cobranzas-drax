import {IEntitySchema} from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "mail",
    name: "SessionEmail",
    apiBasePath: "session-emails",
    apiTag: "SessionEmail",
    collectionName: "SessionEmail",
    schema: {
        mailbox: {type: "ref", ref: "Mailbox", refDisplay: "name", required: true, index: true, header: true},
        user: {type: "ref", ref: "User", refDisplay: "name", required: true, index: true, header: true},
        status: {type: "enum", enum: ["ACTIVE", "PAUSED", "CLOSED"], required: true, index: true, default: "ACTIVE", header: true},
        startedAt: {type: "date", required: true, index: true, header: true},
        pausedAt: {type: "date", required: false, index: true},
        endedAt: {type: "date", required: false, index: true},
        lastActivityAt: {type: "date", required: false, index: true, header: true},
        maxAssignableEmails: {type: "number", required: true, default: 0, header: true},
        assignedCount: {type: "number", required: true, default: 0, header: true},
        repliedCount: {type: "number", required: true, default: 0, header: true},
        closedCount: {type: "number", required: true, default: 0, header: true},
        capacityFillLockedUntil: {type: "date", required: false, index: true},
    },
};

export default entitySchema;
export {entitySchema};
