import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {CreateUserIfNotExist} from "@drax/identity-back";
import TestSetup from "../../setup/TestSetup";
import SessionEmailRoutes from "../../../src/modules/mail/routes/SessionEmailRoutes";
import InboundEmailRoutes from "../../../src/modules/mail/routes/InboundEmailRoutes";
import InboundEmailPermissions from "../../../src/modules/mail/permissions/InboundEmailPermissions";
import {MailboxModel} from "../../../src/modules/mail/models/MailboxModel";
import {InboundEmailModel} from "../../../src/modules/mail/models/InboundEmailModel";
import {SessionEmailModel} from "../../../src/modules/mail/models/SessionEmailModel";
import SessionEmailServiceFactory from "../../../src/modules/mail/factory/services/SessionEmailServiceFactory";

describe("SessionEmail", () => {
    const testSetup = new TestSetup({
        routes: [SessionEmailRoutes, InboundEmailRoutes],
        permissions: [InboundEmailPermissions],
    })
    let operatorTwo: any

    beforeAll(async () => {
        await testSetup.setup()
        operatorTwo = await CreateUserIfNotExist({
            active: true,
            groups: [],
            name: "Mail Operator Two",
            username: "mailOperatorTwo",
            password: "operator.123",
            email: "mail-operator-two@example.com",
            phone: "123456789",
            role: "Admin",
        })
    })

    beforeEach(async () => {
        await testSetup.dropCollection('InboundEmail')
        await testSetup.dropCollection('Mailbox')
        await testSetup.dropCollection('SessionEmail')
        await SessionEmailModel.syncIndexes()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("starts a session and ignores manual assignments when filling auto capacity", async () => {
        const root = await testSetup.rootUserLogin()
        const mailbox = await createMailbox([testSetup.rootUser._id], 5)
        await createInboundEmails(mailbox.email, 7)
        await createInboundEmails(mailbox.email, 2, {assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "MANUAL"})

        const response = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/mailboxes/${mailbox._id}/session-email/start`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(response.statusCode).toBe(200)
        const state = response.json()
        expect(state.assignedEmails).toHaveLength(5)
        expect(state.currentAssignedCount).toBe(5)
        expect(state.session.assignedCount).toBe(5)
    })

    it("allows manual assignment even when auto capacity is full", async () => {
        const root = await testSetup.rootUserLogin()
        const mailbox = await createMailbox([testSetup.rootUser._id], 2)
        await createInboundEmails(mailbox.email, 3)

        const started = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/mailboxes/${mailbox._id}/session-email/start`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        expect(started.statusCode).toBe(200)
        expect(started.json().currentAssignedCount).toBe(2)

        const manualEmail = await InboundEmailModel.findOne({mailbox: mailbox.email, attentionStatus: "PENDING"}).lean()
        const assigned = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/inbound-emails/${manualEmail?._id}/assign-to-me`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(assigned.statusCode).toBe(200)
        expect(assigned.json().assignmentMode).toBe("MANUAL")
        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED"})).toBe(3)
        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"})).toBe(2)
    })

    it("prevents two simultaneous open sessions for the same user and mailbox", async () => {
        const root = await testSetup.rootUserLogin()
        const mailbox = await createMailbox([testSetup.rootUser._id], 5)

        const responses = await Promise.all([
            testSetup.fastifyInstance.inject({
                method: 'POST',
                url: `/api/mailboxes/${mailbox._id}/session-email/start`,
                headers: {Authorization: `Bearer ${root.accessToken}`},
            }),
            testSetup.fastifyInstance.inject({
                method: 'POST',
                url: `/api/mailboxes/${mailbox._id}/session-email/start`,
                headers: {Authorization: `Bearer ${root.accessToken}`},
            }),
        ])

        expect(responses.filter((response) => response.statusCode === 200)).toHaveLength(1)
        expect(await SessionEmailModel.countDocuments({mailbox: mailbox._id, user: testSetup.rootUser._id, status: {$in: ['ACTIVE', 'PAUSED']}})).toBe(1)
    })

    it("does not assign the same pending inbound email to two operators", async () => {
        const root = await testSetup.rootUserLogin()
        const second = await testSetup.login("mailOperatorTwo", "operator.123")
        const mailbox = await createMailbox([testSetup.rootUser._id, operatorTwo._id], 5)
        await createInboundEmails(mailbox.email, 1)

        const responses = await Promise.all([
            testSetup.fastifyInstance.inject({
                method: 'POST',
                url: `/api/mailboxes/${mailbox._id}/session-email/start`,
                headers: {Authorization: `Bearer ${root.accessToken}`},
            }),
            testSetup.fastifyInstance.inject({
                method: 'POST',
                url: `/api/mailboxes/${mailbox._id}/session-email/start`,
                headers: {Authorization: `Bearer ${second.accessToken}`},
            }),
        ])

        expect(responses.every((response) => response.statusCode === 200)).toBe(true)
        const assigned = await InboundEmailModel.find({attentionStatus: "ASSIGNED"}).lean()
        expect(assigned).toHaveLength(1)
        expect(new Set(assigned.map((email) => email._id.toString())).size).toBe(1)
    })

    it("serializes concurrent capacity fills for the same session and never exceeds maxAssignableEmails", async () => {
        const mailbox = await createMailbox([testSetup.rootUser._id], 5)
        await createInboundEmails(mailbox.email, 10)
        await createInboundEmails(mailbox.email, 4, {assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "MANUAL"})
        const session = await SessionEmailModel.create({
            mailbox: mailbox._id,
            user: testSetup.rootUser._id,
            status: "ACTIVE",
            startedAt: new Date(),
            maxAssignableEmails: 5,
            assignedCount: 0,
            repliedCount: 0,
            closedCount: 0,
        })

        await Promise.all(Array.from({length: 5}, () => SessionEmailServiceFactory.instance.fillOperatorCapacity(session._id.toString())))

        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"})).toBe(5)
        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED"})).toBe(9)
        const refreshed = await SessionEmailModel.findById(session._id).lean()
        expect(refreshed?.assignedCount).toBe(5)
    })

    it("does not refill while paused and refills when resumed", async () => {
        const root = await testSetup.rootUserLogin()
        const mailbox = await createMailbox([testSetup.rootUser._id], 2)
        await createInboundEmails(mailbox.email, 3)

        const started = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/mailboxes/${mailbox._id}/session-email/start`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const sessionId = started.json().session._id
        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/session-email/${sessionId}/pause`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const assigned = await InboundEmailModel.findOne({assignedSession: sessionId, attentionStatus: "ASSIGNED"}).lean()

        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/inbound-emails/${assigned?._id}/close`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED"})).toBe(1)

        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/session-email/${sessionId}/resume`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED"})).toBe(2)
    })

    it("management views split manual assigned to me from auto assigned in attention", async () => {
        const root = await testSetup.rootUserLogin()
        const mailbox = await createMailbox([testSetup.rootUser._id], 5)
        const session = await SessionEmailModel.create({
            mailbox: mailbox._id,
            user: testSetup.rootUser._id,
            status: "ACTIVE",
            startedAt: new Date(),
            maxAssignableEmails: 5,
            assignedCount: 1,
            repliedCount: 0,
            closedCount: 0,
        })
        await createInboundEmails(mailbox.email, 1, {assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "MANUAL"})
        await createInboundEmails(mailbox.email, 1, {assignedTo: testSetup.rootUser._id, assignedSession: session._id, attentionStatus: "ASSIGNED", assignmentMode: "AUTO"})

        const manual = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/inbound-emails/management?mailboxId=${mailbox._id}&view=ASSIGNED_TO_ME&page=1&pageSize=10`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const auto = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/inbound-emails/management?mailboxId=${mailbox._id}&view=ASSIGNED_IN_ATTENTION&page=1&pageSize=10`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(manual.statusCode).toBe(200)
        expect(auto.statusCode).toBe(200)
        expect(manual.json().totalItems).toBe(1)
        expect(manual.json().items[0].assignmentMode).toBe("MANUAL")
        expect(auto.json().totalItems).toBe(1)
        expect(auto.json().items[0].assignmentMode).toBe("AUTO")
    })

    it("closing a session releases auto assignments and keeps manual assignments", async () => {
        const root = await testSetup.rootUserLogin()
        const mailbox = await createMailbox([testSetup.rootUser._id], 2)
        await createInboundEmails(mailbox.email, 3)
        await createInboundEmails(mailbox.email, 1, {assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED", assignmentMode: "MANUAL"})
        const started = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/mailboxes/${mailbox._id}/session-email/start`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const sessionId = started.json().session._id

        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/session-email/${sessionId}/close`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedTo: testSetup.rootUser._id, attentionStatus: "ASSIGNED"})).toBe(1)
        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, assignedSession: sessionId, attentionStatus: "ASSIGNED"})).toBe(0)
        expect(await InboundEmailModel.countDocuments({mailbox: mailbox.email, attentionStatus: "PENDING"})).toBe(3)
    })

    it("counts replies once per inbound email during the session", async () => {
        const mailbox = await createMailbox([testSetup.rootUser._id], 1)
        const session = await SessionEmailModel.create({
            mailbox: mailbox._id,
            user: testSetup.rootUser._id,
            status: "ACTIVE",
            startedAt: new Date(),
            maxAssignableEmails: 1,
            assignedCount: 1,
            repliedCount: 0,
            closedCount: 0,
        })
        const [email] = await createInboundEmails(mailbox.email, 1, {
            assignedTo: testSetup.rootUser._id,
            assignedSession: session._id,
            attentionStatus: "ASSIGNED",
            assignmentMode: "AUTO",
        })

        await SessionEmailServiceFactory.instance.onInboundEmailReplied(email)
        await SessionEmailServiceFactory.instance.onInboundEmailReplied(email)

        const refreshed = await SessionEmailModel.findById(session._id).lean()
        expect(refreshed?.repliedCount).toBe(1)
    })
})

async function createMailbox(operatorIds: any[], maxAssignableEmailsPerUser: number) {
    return await MailboxModel.create({
        name: `Mailbox ${Date.now()} ${Math.random()}`,
        email: `mailbox-${Date.now()}-${Math.random()}@example.com`,
        username: "mailbox",
        password: "password",
        operators: operatorIds,
        maxAssignableEmailsPerUser,
        isActive: true,
    })
}

async function createInboundEmails(mailbox: string, count: number, patch: Record<string, any> = {}) {
    const now = Date.now()
    return await InboundEmailModel.insertMany(Array.from({length: count}, (_, index) => ({
        messageId: `inbound-${now}-${Math.random()}-${index}`,
        mailbox,
        sourceChannel: "EMAIL",
        receivedAt: new Date(now + index),
        subject: `Email ${index}`,
        fromEmail: `sender-${index}@example.com`,
        customer: {name: `Customer ${index}`},
        attentionStatus: "PENDING",
        processingStatus: "PROCESSED",
        ...patch,
    })))
}
