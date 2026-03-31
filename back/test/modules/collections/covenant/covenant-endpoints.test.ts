import { describe, it, beforeAll, afterAll, expect } from "vitest"
import CovenantRoutes from "../../../../src/modules/collections/routes/CovenantRoutes"
import CovenantPermissions from "../../../../src/modules/collections/permissions/CovenantPermissions"
import { BasePermissions } from "../../../../src/modules/base/permissions/BasePermissions"
import TestSetup from "../../../setup/TestSetup"
import type { ICovenantBase } from "../../../../src/modules/collections/interfaces/ICovenant"

describe("Covenant Endpoints Test", function () {

    let testSetup = new TestSetup({
        routes: [CovenantRoutes],
        permissions: [CovenantPermissions, BasePermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    const sampleDate = new Date().toISOString()
    const validGroupObjId = "60b8d295f1d2b21c4857b2b0"

    const baseCovenantData: Partial<ICovenantBase> = {
        date: new Date(sampleDate),
        since: "2023-01",
        until: "2023-12",
        month: "January",
        fullname: "John Doe",
        dni: "12345678",
        locality: "Buenos Aires",
        address: "Av Corrientes 123",
        amount: 15000.5,
        group: validGroupObjId as any,
    }

    it("should create a new Covenant and find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const newCovenant: Partial<ICovenantBase> = {
            ...baseCovenantData,
            createdBy: testSetup.rootUser._id.toString(),
            updatedBy: testSetup.rootUser._id.toString()
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/covenants',
            payload: newCovenant,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const covenant = await resp.json()
        if (resp.statusCode !== 200) {
            console.error("CREATE FAILED:", covenant);
        }
        expect(resp.statusCode).toBe(200)
        expect(covenant._id).toBeDefined()

        // Verify by fetching
        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants/' + covenant._id,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const getCovenant = await getResp.json()
        expect(getResp.statusCode).toBe(200)
        expect(getCovenant.dni).toBe("12345678")
    })

    it("should create and update a Covenant and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const newCovenant: Partial<ICovenantBase> = {
            ...baseCovenantData
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/covenants',
            payload: newCovenant,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const covenant = await resp.json()
        if (resp.statusCode !== 200) {
            console.error("CREATE FAILED [update]:", covenant);
        }
        expect(resp.statusCode).toBe(200)

        const updateData: Partial<ICovenantBase> = {
            ...baseCovenantData,
            amount: 25000.75,
            comment: "Updated amount via PUT"
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/covenants/${covenant._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/covenants/${covenant._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedCovenant = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedCovenant.amount).toBe(25000.75)
        expect(verifiedCovenant.comment).toBe("Updated amount via PUT")
    })

    it("should create and update partial a Covenant and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const newCovenant: Partial<ICovenantBase> = {
            ...baseCovenantData
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/covenants',
            payload: newCovenant,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const covenant = await resp.json()
        if (resp.statusCode !== 200) {
            console.error("CREATE FAILED [partial]:", covenant);
        }
        expect(resp.statusCode).toBe(200)

        const updateData: any = {
            status: "Approved",
            locality: "Cordoba"
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/covenants/${covenant._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/covenants/${covenant._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedCovenant = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedCovenant.status).toBe("Approved")
        expect(verifiedCovenant.locality).toBe("Cordoba")
        expect(verifiedCovenant.dni).toBe("12345678") // Ensure unchanged fields remain
    })

    it("should create and delete a Covenant", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const newCovenant: Partial<ICovenantBase> = {
            ...baseCovenantData
        }

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/covenants',
            payload: newCovenant,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdCovenant = await createResp.json()
        if (createResp.statusCode !== 200) {
            console.error("CREATE FAILED [delete]:", createdCovenant);
        }
        expect(createResp.statusCode).toBe(200)

        const deleteResp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/covenants/${createdCovenant._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(deleteResp.statusCode).toBe(200)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/covenants/${createdCovenant._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(verifyResp.statusCode).toBe(404)
    })

    it("Should create and paginate Covenants", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const covenantData = [
            { ...baseCovenantData, dni: "10000001", fullname: "Covenant 1", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseCovenantData, dni: "10000002", fullname: "Covenant 2", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() }
        ]

        for (const data of covenantData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/covenants',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const result = await resp.json()
        if (resp.statusCode !== 200) {
            console.error("PAGINATE GET FAILED:", result);
        }
        expect(resp.statusCode).toBe(200)
        expect(result.total).toBe(2)
        expect(result.page).toBe(1)
        expect(result.items.some((i: any) => i.fullname === "Covenant 1")).toBe(true)
        expect(result.items.some((i: any) => i.fullname === "Covenant 2")).toBe(true)
    })

    it("should create and search for Covenants", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const covenantData = [
            { ...baseCovenantData, dni: "90000000", fullname: "Alpha Search Target", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseCovenantData, dni: "90000001", fullname: "Beta Search target", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseCovenantData, dni: "90000002", fullname: "Gamma Other", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() }
        ]

        for (const data of covenantData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/covenants',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const searchResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants/search?search=Search',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const searchResult = await searchResp.json()
        if (searchResp.statusCode !== 200) {
            console.error("SEARCH GET FAILED:", searchResult);
        }
        expect(searchResp.statusCode).toBe(200)
        expect(searchResult.length).toBe(2)
        expect(searchResult.some((c: any) => c.fullname === "Alpha Search Target")).toBe(true)
    })

    it("should create and find Covenants with filters", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const covenantData = [
            { ...baseCovenantData, dni: "80000001", status: "Active", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseCovenantData, dni: "80000002", status: "Inactive", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() }
        ]

        for (const data of covenantData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/covenants',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const findByResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants/find?filters=status;eq;Active',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const findByResult = await findByResp.json()
        if (findByResp.statusCode !== 200) {
            console.error("FIND BY GET FAILED:", findByResult);
        }
        expect(findByResp.statusCode).toBe(200)
        expect(findByResult[0].status).toBe("Active")
        expect(findByResult[0].dni).toBe("80000001")
    })

    it("should create and groupBy for Covenants", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const covenantData = [
            { ...baseCovenantData, locality: "LocA", status: "Pending", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseCovenantData, locality: "LocB", status: "Pending", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseCovenantData, locality: "LocB", status: "Pending", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() }
        ]

        for (const data of covenantData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/covenants',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const groupResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants/group-by?fields=locality,status',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const groupResult = await groupResp.json()
        expect(groupResp.statusCode).toBe(200)
        // Depending on order
        const locB = groupResult.find((g: any) => g.locality === "LocB")
        const locA = groupResult.find((g: any) => g.locality === "LocA")
        expect(locB.count).toBe(2)
        expect(locA.count).toBe(1)
    })

    it("should export Covenants to Excel by date and group", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Covenant')

        const exportDate = new Date('2026-03-31T00:00:00.000Z')
        const covenantData = [
            {
                ...baseCovenantData,
                date: exportDate,
                dni: "70000001",
                fullname: "Excel Export One",
                createdBy: testSetup.rootUser._id.toString(),
                updatedBy: testSetup.rootUser._id.toString()
            },
            {
                ...baseCovenantData,
                date: exportDate,
                dni: "70000002",
                fullname: "Excel Export Two",
                createdBy: testSetup.rootUser._id.toString(),
                updatedBy: testSetup.rootUser._id.toString()
            }
        ]

        for (const data of covenantData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/covenants',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/covenants/export-excel?date=${encodeURIComponent(exportDate.toISOString())}&group=${validGroupObjId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(resp.statusCode).toBe(200)
        expect(resp.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(resp.headers['content-disposition']).toContain('.xlsx')
        expect(resp.body.length).toBeGreaterThan(0)
    })

    it("should handle error responses correctly when Covenant is not found", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        const nonExistentId = "123456789012345678901234"

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/covenants/${nonExistentId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(resp.statusCode).toBe(404)
        const result = await resp.json()
        expect(result.error).toBeDefined()
        expect(result.message).toContain("Not found")
    })

    it("should return 401 when accessing endpoints without token", async () => {
        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants'
        });
        expect(resp.statusCode).toBe(401);
    });

    it("should return 403 when creating with restricted user", async () => {
        const { accessToken } = await testSetup.basicUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/covenants',
            payload: { ...baseCovenantData, fullname: "Forbidden", createdBy: testSetup.basicUser._id.toString(), updatedBy: testSetup.basicUser._id.toString() },
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(403);
    });

    it("should return 422 when creating with missing mandatory fields", async () => {
        const { accessToken } = await testSetup.rootUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/covenants',
            payload: {},
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        expect(resp.statusCode).toBe(422);
    });

    it("should return 400 when providing invalid ID format", async () => {
        const { accessToken } = await testSetup.rootUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/covenants/invalid-id-format',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(400);
    });
})
