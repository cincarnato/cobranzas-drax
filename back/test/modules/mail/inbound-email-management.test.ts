import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest";
import TestSetup from "../../setup/TestSetup";
import InboundEmailRoutes from "../../../src/modules/mail/routes/InboundEmailRoutes";
import InboundEmailPermissions from "../../../src/modules/mail/permissions/InboundEmailPermissions";
import {MailboxModel} from "../../../src/modules/mail/models/MailboxModel";
import {InboundEmailModel} from "../../../src/modules/mail/models/InboundEmailModel";
import {OutboundEmailModel} from "../../../src/modules/mail/models/OutboundEmailModel";
import {EmailUserStateModel} from "../../../src/modules/mail/models/EmailUserStateModel";

describe("InboundEmail management endpoints", () => {
    const testSetup = new TestSetup({
        routes: [InboundEmailRoutes],
        permissions: [InboundEmailPermissions],
    });

    beforeAll(async () => {
        await testSetup.setup();
    });

    beforeEach(async () => {
        await testSetup.dropCollection("InboundEmail");
        await testSetup.dropCollection("OutboundEmail");
        await testSetup.dropCollection("EmailUserState");
        await testSetup.dropCollection("Mailbox");
    });

    afterAll(async () => {
        await testSetup.dropAndClose();
    });

    it("returns only list fields used by EmailManagement", async () => {
        const root = await testSetup.rootUserLogin();
        const mailbox = await createMailbox(testSetup.rootUser._id);
        const [email] = await createInboundEmails(mailbox.email, 1, {
            assignedTo: testSetup.rootUser._id,
            attentionStatus: "ASSIGNED",
            assignmentMode: "MANUAL",
        });
        await EmailUserStateModel.create({
            inboundEmail: email._id,
            user: testSetup.rootUser._id,
            isRead: false,
            isStarred: true,
        });

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/inbound-emails/management?mailboxId=${mailbox._id}&view=ASSIGNED_TO_ME&page=1&pageSize=25`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(response.statusCode).toBe(200);
        const item = response.json().items[0];
        expect(item).toMatchObject({
            _id: email._id.toString(),
            subject: "Loaded email",
            fromName: "Loaded Sender",
            fromEmail: "loaded@example.com",
            attentionStatus: "ASSIGNED",
            assignmentMode: "MANUAL",
            replyCount: 0,
            hasAttachments: true,
            attachmentCount: 1,
            category: "Pedidos",
            priority: "Alta",
            sentiment: "Urgente",
            summary: "Short summary",
            tags: ["tag-a"],
            processingStatus: "ERROR",
            isDuplicate: true,
        });
        expect(item.assignedTo).toMatchObject({_id: testSetup.rootUser._id.toString()});
        expect(item.userState).toMatchObject({isRead: false, isStarred: true});
        expect(item.bodyHtml).toBeUndefined();
        expect(item.bodyText).toBeUndefined();
        expect(item.normalizedText).toBeUndefined();
        expect(item.attachments).toBeUndefined();
        expect(item.attachmentsOcrText).toBeUndefined();
        expect(item.processMarks).toBeUndefined();
        expect(item.customer).toBeUndefined();
        expect(item.extractedEntities).toBeUndefined();
    });

    it("returns detail without mailbox credentials or unused technical fields", async () => {
        const root = await testSetup.rootUserLogin();
        const mailbox = await createMailbox(testSetup.rootUser._id);
        const [email] = await createInboundEmails(mailbox.email, 1, {
            assignedTo: testSetup.rootUser._id,
            attentionStatus: "ASSIGNED",
        });
        await OutboundEmailModel.create({
            inboundEmail: email._id,
            mailbox: mailbox._id,
            user: testSetup.rootUser._id,
            fromEmail: mailbox.email,
            toEmails: ["loaded@example.com"],
            subject: "Reply",
            bodyText: "reply text",
            bodyHtml: "<p>reply text</p>",
            attachments: [{filename: "reply.pdf", filepath: "/tmp/reply.pdf", size: 20, url: "/reply.pdf"}],
            status: "SENT",
            messageId: "outbound-message",
            sentAt: new Date(),
        });

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/inbound-emails/${email._id}/management-detail`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.mailbox).toMatchObject({
            _id: mailbox._id.toString(),
            name: mailbox.name,
            email: mailbox.email,
            replyRequiredToClose: true,
            closeReasonRequired: true,
        });
        expect(Object.keys(body.mailbox).sort()).toEqual([
            "_id",
            "categories",
            "closeReasonRequired",
            "closeReasons",
            "email",
            "name",
            "operators",
            "priorities",
            "replyRequiredToClose",
            "sentiments",
        ]);
        expect(body.mailbox.username).toBeUndefined();
        expect(body.mailbox.password).toBeUndefined();
        expect(body.mailbox.imapHost).toBeUndefined();
        expect(body.mailbox.smtpHost).toBeUndefined();
        expect(body.mailbox.processingProtocol).toBeUndefined();
        expect(body.mailbox.tags).toBeUndefined();
        expect(body.inboundEmail.bodyHtml).toBe("<p>heavy html</p>");
        expect(body.inboundEmail.attachments).toHaveLength(1);
        expect(body.inboundEmail.attachmentsOcrText).toBeUndefined();
        expect(body.inboundEmail.processMarks).toBeUndefined();
        expect(body.inboundThread[0].bodyText).toBe("heavy text");
        expect(body.inboundThread[0].attachmentsOcrText).toBeUndefined();
        expect(body.outboundThread[0].bodyHtml).toBe("<p>reply text</p>");
        expect(body.outboundThread[0].mailbox).toBeUndefined();
    });
});

async function createMailbox(operatorId: any) {
    return await MailboxModel.create({
        name: `Management Mailbox ${Date.now()} ${Math.random()}`,
        email: `management-${Date.now()}-${Math.random()}@example.com`,
        username: "secret-user",
        password: "secret-password",
        categories: [{name: "Pedidos", description: "Pedidos", managementUrl: "/pedidos"}],
        closeReasons: [{name: "Resuelto"}],
        operators: [operatorId],
        sentiments: [{name: "Urgente", emoji: "!", description: "Urgente"}],
        priorities: [{name: "Alta", icon: "mdi-alert", color: "red", description: "Alta"}],
        tags: ["tag-a"],
        replyRequiredToClose: true,
        closeReasonRequired: true,
        processingProtocol: "IMAP",
        imapHost: "imap.example.com",
        smtpHost: "smtp.example.com",
        isActive: true,
    });
}

async function createInboundEmails(mailbox: string, count: number, patch: Record<string, any> = {}) {
    const now = Date.now();
    return await InboundEmailModel.insertMany(Array.from({length: count}, (_, index) => ({
        messageId: `management-${now}-${Math.random()}-${index}`,
        mailbox,
        sourceChannel: "EMAIL",
        receivedAt: new Date(now + index),
        subject: "Loaded email",
        fromName: "Loaded Sender",
        fromEmail: "loaded@example.com",
        toEmails: ["team@example.com"],
        replyToEmail: "reply@example.com",
        bodyText: "heavy text",
        bodyHtml: "<p>heavy html</p>",
        normalizedText: "heavy normalized text",
        hasAttachments: true,
        attachmentCount: 1,
        attachments: [{filename: "invoice.pdf", filepath: "/tmp/invoice.pdf", size: 10, url: "/invoice.pdf"}],
        attachmentsOcrText: "heavy ocr text",
        attachmentsOcrError: "ocr failed",
        category: "Pedidos",
        closeReason: "Resuelto",
        priority: "Alta",
        sentiment: "Urgente",
        summary: "Short summary",
        tags: ["tag-a"],
        customer: {name: "Customer", documentNumber: "123"},
        extractedEntities: [{label: "Factura", value: "A-1", source: "BODY", confidence: 0.9}],
        processMarks: [{key: "heavy", status: "FAILED", markedAt: new Date(), lastError: "large error"}],
        attentionStatus: "PENDING",
        processingStatus: "ERROR",
        isDuplicate: true,
        ...patch,
    })));
}
