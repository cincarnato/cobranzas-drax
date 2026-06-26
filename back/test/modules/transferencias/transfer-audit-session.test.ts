import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {CreateUserIfNotExist} from "@drax/identity-back";
import TestSetup from "../../setup/TestSetup";
import TransferAuditSessionRoutes from "../../../src/modules/transferencias/routes/TransferAuditSessionRoutes";
import TransferEmailRoutes from "../../../src/modules/transferencias/routes/TransferEmailRoutes";
import TransferEmailPermissions from "../../../src/modules/transferencias/permissions/TransferEmailPermissions";
import {TransferEmailModel} from "../../../src/modules/transferencias/models/TransferEmailModel";

describe("TransferAuditSession", () => {
    const testSetup = new TestSetup({
        routes: [TransferAuditSessionRoutes, TransferEmailRoutes],
        permissions: [TransferEmailPermissions],
    })

    beforeAll(async () => {
        await testSetup.setup()
        await CreateUserIfNotExist({
            active: true,
            groups: [],
            name: "Operator Two",
            username: "operatorTwo",
            password: "operator.123",
            email: "operator-two@example.com",
            phone: "123456789",
            role: "Admin",
        })
    })

    beforeEach(async () => {
        await testSetup.dropCollection('TransferEmail')
        await testSetup.dropCollection('TransferAuditSession')
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("does not assign the same transfer email to two operators", async () => {
        await createPendingTransferEmails(6)
        const root = await testSetup.rootUserLogin()
        const operatorTwo = await testSetup.login("operatorTwo", "operator.123")

        const first = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 5},
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const second = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 5},
            headers: {Authorization: `Bearer ${operatorTwo.accessToken}`},
        })

        expect(first.statusCode).toBe(200)
        expect(second.statusCode).toBe(200)
        const firstIds = first.json().items.map((item) => item._id)
        const secondIds = second.json().items.map((item) => item._id)
        expect(firstIds.some((id) => secondIds.includes(id))).toBe(false)
    })

    it("prevents an operator from auditing another operator assignment", async () => {
        await createPendingTransferEmails(1)
        const root = await testSetup.rootUserLogin()
        const operatorTwo = await testSetup.login("operatorTwo", "operator.123")

        const sessionResponse = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 1},
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const state = sessionResponse.json()
        const transferEmail = state.items[0]

        const auditResponse = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/transfer-emails/${transferEmail._id}/audit`,
            payload: {
                amount: transferEmail.amount,
                affiliates: transferEmail.affiliates,
                humanStatus: 'VALIDADO',
                transferDate: transferEmail.transferDate,
                auditSessionId: state.session._id,
            },
            headers: {Authorization: `Bearer ${operatorTwo.accessToken}`},
        })

        expect(auditResponse.statusCode).toBe(409)
    })

    it("recovers records whose lease expired", async () => {
        await createPendingTransferEmails(1)
        const root = await testSetup.rootUserLogin()
        const operatorTwo = await testSetup.login("operatorTwo", "operator.123")

        const first = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 1},
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const assigned = first.json().items[0]

        await TransferEmailModel.updateOne(
            {_id: assigned._id},
            {$set: {assignmentExpiresAt: new Date(Date.now() - 1000)}}
        )

        const second = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 1},
            headers: {Authorization: `Bearer ${operatorTwo.accessToken}`},
        })

        expect(second.statusCode).toBe(200)
        expect(second.json().items[0]._id).toBe(assigned._id)
    })

    it("pausing releases pending assignments", async () => {
        await createPendingTransferEmails(2)
        const root = await testSetup.rootUserLogin()

        const started = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 2},
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const sessionId = started.json().session._id

        const paused = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/transfer-audit-sessions/${sessionId}/pause`,
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(paused.statusCode).toBe(200)
        const stillAssigned = await TransferEmailModel.countDocuments({auditSessionId: sessionId})
        expect(stillAssigned).toBe(0)
    })

    it("auditing completes the transfer email fields", async () => {
        await createPendingTransferEmails(1)
        const root = await testSetup.rootUserLogin()

        const sessionResponse = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/transfer-audit-sessions',
            payload: {batchSize: 1},
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const state = sessionResponse.json()
        const transferEmail = state.items[0]

        const auditResponse = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: `/api/transfer-emails/${transferEmail._id}/audit`,
            payload: {
                amount: 1500,
                affiliates: transferEmail.affiliates,
                humanStatus: 'VALIDADO',
                transferDate: transferEmail.transferDate,
                auditSessionId: state.session._id,
            },
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })

        expect(auditResponse.statusCode).toBe(200)
        const audited = auditResponse.json()
        expect(audited.status).toBe('AUDITADO')
        expect(audited.humanStatus).toBe('VALIDADO')
        expect(audited.auditedBy._id || audited.auditedBy).toBeDefined()
        expect(audited.auditedAt).toBeDefined()
        expect(audited.assignedTo).toBeUndefined()

        const activeResponse = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/transfer-audit-sessions/active',
            headers: {Authorization: `Bearer ${root.accessToken}`},
        })
        const activeState = activeResponse.json()
        expect(activeState.session.auditedCount).toBe(1)
        expect(activeState.session.validatedCount).toBe(1)
        expect(activeState.stats.auditedCount).toBe(1)
        expect(activeState.stats.validatedCount).toBe(1)
    })
})

async function createPendingTransferEmails(count: number) {
    const docs = Array.from({length: count}, (_, index) => ({
        emailMessageId: `message-${Date.now()}-${index}`,
        emailSubject: `Transfer ${index}`,
        amount: 1000 + index,
        currency: 'ARS',
        transferDate: new Date(),
        emailDate: new Date(Date.now() + index),
        affiliates: [{name: `Affiliate ${index}`, amount: 1000 + index}],
        aiStatus: 'PROCESADO_CONFIABLE',
        humanStatus: 'PENDIENTE',
        status: 'PENDIENTE_AUDITORIA',
        needsHumanReview: true,
    }))

    await TransferEmailModel.insertMany(docs)
}
