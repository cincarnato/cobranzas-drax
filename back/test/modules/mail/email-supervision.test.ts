import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from "vitest";
import {CreateUserIfNotExist} from "@drax/identity-back";
import TestSetup from "../../setup/TestSetup";
import EmailSupervisionRoutes from "../../../src/modules/mail/routes/EmailSupervisionRoutes";
import InboundEmailPermissions from "../../../src/modules/mail/permissions/InboundEmailPermissions";
import {MailboxModel} from "../../../src/modules/mail/models/MailboxModel";
import {InboundEmailModel} from "../../../src/modules/mail/models/InboundEmailModel";
import {SessionEmailModel} from "../../../src/modules/mail/models/SessionEmailModel";

describe("EmailSupervision", () => {
    const testSetup = new TestSetup({
        routes: [EmailSupervisionRoutes],
        permissions: [InboundEmailPermissions],
    });
    let operatorTwo: any;
    let operatorThree: any;
    let operatorWithoutSession: any;

    beforeAll(async () => {
        await testSetup.setup();
        operatorTwo = await createUser("supervisionOperatorTwo", "Mail Operator Two");
        operatorThree = await createUser("supervisionOperatorThree", "Mail Operator Three");
        operatorWithoutSession = await createUser("supervisionNoSession", "Mail No Session");
    });

    beforeEach(async () => {
        await testSetup.dropCollection("InboundEmail");
        await testSetup.dropCollection("Mailbox");
        await testSetup.dropCollection("SessionEmail");
        await SessionEmailModel.syncIndexes();
    });

    afterAll(async () => {
        await testSetup.dropAndClose();
    });

    it("returns live summary and open SessionEmail operator rows", async () => {
        const root = await testSetup.rootUserLogin();
        const mailbox = await createMailbox([testSetup.rootUser._id, operatorTwo._id, operatorWithoutSession._id], 5);
        const now = new Date();
        await SessionEmailModel.create({
            mailbox: mailbox._id,
            user: testSetup.rootUser._id,
            status: "ACTIVE",
            startedAt: new Date(now.getTime() - 60_000),
            lastActivityAt: now,
            maxAssignableEmails: 5,
            assignedCount: 26,
            repliedCount: 21,
            closedCount: 19,
        });
        await SessionEmailModel.create({
            mailbox: mailbox._id,
            user: operatorTwo._id,
            status: "PAUSED",
            startedAt: new Date(now.getTime() - 120_000),
            lastActivityAt: new Date(now.getTime() - 30_000),
            maxAssignableEmails: 5,
            assignedCount: 18,
            repliedCount: 15,
            closedCount: 14,
        });
        await createInboundEmails(mailbox.email, 3);
        await createInboundEmails(mailbox.email, 3, {assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"});
        await createInboundEmails(mailbox.email, 1, {assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "MANUAL"});
        await createInboundEmails(mailbox.email, 2, {assignedTo: operatorTwo._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"});
        await createInboundEmails(mailbox.email, 5, {attentionStatus: "CLOSED", closedAt: now});
        await createInboundEmails(mailbox.email, 2, {attentionStatus: "CLOSED", closedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000)});

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/mailboxes/${mailbox._id}/supervision/email/live`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.summary).toMatchObject({
            activeOperators: 1,
            pausedOperators: 1,
            pendingEmails: 3,
            assignedEmails: 6,
            closedToday: 5,
        });
        expect(body.operators).toHaveLength(2);
        expect(body.operators.find((row: any) => row.user.id === testSetup.rootUser._id.toString())).toMatchObject({
            status: "ACTIVE",
            currentAssignedCount: 3,
            sessionEmail: {
                assignedCount: 26,
                repliedCount: 21,
                closedCount: 19,
            },
        });
        expect(body.operators.find((row: any) => row.user.id === operatorTwo._id.toString())).toMatchObject({
            status: "PAUSED",
            currentAssignedCount: 2,
        });
    });

    it("includes mailbox operators without an open SessionEmail only when requested", async () => {
        const root = await testSetup.rootUserLogin();
        const mailbox = await createMailbox([testSetup.rootUser._id, operatorThree._id], 5);
        await SessionEmailModel.create({
            mailbox: mailbox._id,
            user: operatorThree._id,
            status: "CLOSED",
            startedAt: new Date(),
            endedAt: new Date(),
            maxAssignableEmails: 5,
            assignedCount: 7,
            repliedCount: 3,
            closedCount: 4,
        });
        await createInboundEmails(mailbox.email, 2, {assignedTo: operatorThree._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"});
        await createInboundEmails(mailbox.email, 1, {assignedTo: operatorThree._id, attentionStatus: "ASSIGNED", assignmentMode: "MANUAL"});

        const defaultResponse = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/mailboxes/${mailbox._id}/supervision/email/live`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });
        const withWithoutSession = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/mailboxes/${mailbox._id}/supervision/email/live?includeWithoutSession=true`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(defaultResponse.statusCode).toBe(200);
        expect(defaultResponse.json().operators).toHaveLength(0);
        expect(withWithoutSession.statusCode).toBe(200);
        const row = withWithoutSession.json().operators.find((item: any) => item.user.id === operatorThree._id.toString());
        expect(row).toMatchObject({
            status: "OUT_OF_SESSION",
            sessionEmail: null,
            currentAssignedCount: 2,
        });
    });

    it("returns current assigned emails without heavy fields", async () => {
        const root = await testSetup.rootUserLogin();
        const mailbox = await createMailbox([testSetup.rootUser._id], 5);
        await createInboundEmails(mailbox.email, 1, {
            assignedTo: testSetup.rootUser._id,
            attentionStatus: "ASSIGNED",
            bodyHtml: "<p>heavy</p>",
            bodyText: "heavy",
            attachments: [{filename: "a.pdf", filepath: "/tmp/a.pdf", size: 1, url: "/a.pdf"}],
            attachmentsOcrText: "heavy",
            normalizedText: "heavy",
        });

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/mailboxes/${mailbox._id}/supervision/email/operators/${testSetup.rootUser._id}/assigned-emails`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(response.statusCode).toBe(200);
        const [email] = response.json();
        expect(email.subject).toBeDefined();
        expect(email.bodyHtml).toBeUndefined();
        expect(email.bodyText).toBeUndefined();
        expect(email.attachments).toBeUndefined();
        expect(email.attachmentsOcrText).toBeUndefined();
        expect(email.normalizedText).toBeUndefined();
    });

    it("rejects users without supervision permissions", async () => {
        const basic = await testSetup.basicUserLogin();
        const mailbox = await createMailbox([testSetup.basicUser._id], 5);

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/mailboxes/${mailbox._id}/supervision/email/live`,
            headers: {Authorization: `Bearer ${basic.accessToken}`},
        });

        expect(response.statusCode).toBe(403);
    });

    it("returns not found for an invalid mailbox", async () => {
        const root = await testSetup.rootUserLogin();

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: "/api/mailboxes/64bb00000000000000000000/supervision/email/live",
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(response.statusCode).toBe(404);
    });

    it("does not count current assigned emails with one query per operator", async () => {
        const root = await testSetup.rootUserLogin();
        const operators = await Promise.all(Array.from({length: 20}, (_, index) => createUser(`supervisionBulk${index}`, `Bulk ${index}`)));
        const mailbox = await createMailbox([testSetup.rootUser._id, ...operators.map((operator) => operator._id)], 5);
        await Promise.all(operators.map((operator) => SessionEmailModel.create({
            mailbox: mailbox._id,
            user: operator._id,
            status: "ACTIVE",
            startedAt: new Date(),
            maxAssignableEmails: 5,
            assignedCount: 0,
            repliedCount: 0,
            closedCount: 0,
        })));
        await Promise.all(operators.map((operator) => createInboundEmails(mailbox.email, 1, {assignedTo: operator._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"})));
        const countSpy = vi.spyOn(InboundEmailModel, "countDocuments");

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/mailboxes/${mailbox._id}/supervision/email/live`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().operators).toHaveLength(20);
        expect(countSpy).toHaveBeenCalledTimes(1);
        countSpy.mockRestore();
    });
});

async function createUser(username: string, name: string) {
    return await CreateUserIfNotExist({
        active: true,
        groups: [],
        name,
        username,
        password: "operator.123",
        email: `${username}@example.com`,
        phone: "123456789",
        role: "Admin",
    });
}

async function createMailbox(operatorIds: any[], maxAssignableEmailsPerUser: number) {
    return await MailboxModel.create({
        name: `Mailbox ${Date.now()} ${Math.random()}`,
        email: `mailbox-${Date.now()}-${Math.random()}@example.com`,
        username: "mailbox",
        password: "password",
        operators: operatorIds,
        maxAssignableEmailsPerUser,
        isActive: true,
    });
}

async function createInboundEmails(mailbox: string, count: number, patch: Record<string, any> = {}) {
    const now = Date.now();
    return await InboundEmailModel.insertMany(Array.from({length: count}, (_, index) => ({
        messageId: `supervision-${now}-${Math.random()}-${index}`,
        mailbox,
        sourceChannel: "EMAIL",
        receivedAt: new Date(now + index),
        subject: `Email ${index}`,
        fromName: `Sender ${index}`,
        fromEmail: `sender-${index}@example.com`,
        customer: {name: `Customer ${index}`},
        attentionStatus: "PENDING",
        processingStatus: "PROCESSED",
        ...patch,
    })));
}
