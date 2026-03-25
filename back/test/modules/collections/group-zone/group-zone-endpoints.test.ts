import { describe, it, beforeAll, afterAll, expect } from "vitest"
import { GroupZoneFastifyRoutes } from "../../../../src/modules/collections/routes/GroupZoneRoutes"
import { GroupZonePermissions } from "../../../../src/modules/collections/permissions/GroupZonePermissions"
import TestSetup from "../../../setup/TestSetup"
import type { IGroupZoneBase } from "../../../../src/modules/collections/interfaces/IGroupZone"

describe("GroupZone Endpoints Test", function () {

    let testSetup = new TestSetup({
        routes: [GroupZoneFastifyRoutes],
        permissions: [GroupZonePermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    const baseGroupZoneData: Partial<IGroupZoneBase> = {
        name: "Test Group Zone",
        users: []
    }

    it("should create a new GroupZone and find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('group')

        const newGroupZone: Partial<IGroupZoneBase> = {
            ...baseGroupZoneData,
            createdBy: testSetup.rootUser._id.toString(),
            updatedBy: testSetup.rootUser._id.toString()
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/group-zones',
            payload: newGroupZone,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const groupZone = await resp.json()
        if (resp.statusCode !== 200) console.error("CREATE FAILED:", groupZone)
        expect(resp.statusCode).toBe(200)
        expect(groupZone.name).toBe("Test Group Zone")
        expect(groupZone._id).toBeDefined()

        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/group-zones/' + groupZone._id,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const getGroupZone = await getResp.json()
        expect(getResp.statusCode).toBe(200)
        expect(getGroupZone.name).toBe("Test Group Zone")
    })

    it("should create and update a GroupZone and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('group')

        const newGroupZone: Partial<IGroupZoneBase> = {
            ...baseGroupZoneData,
            createdBy: testSetup.rootUser._id.toString(),
            updatedBy: testSetup.rootUser._id.toString()
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/group-zones',
            payload: newGroupZone,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const groupZone = await resp.json()
        expect(resp.statusCode).toBe(200)

        const updateData: Partial<IGroupZoneBase> = {
            ...baseGroupZoneData,
            name: "Updated Group Zone",
            createdBy: testSetup.rootUser._id.toString(),
            updatedBy: testSetup.rootUser._id.toString()
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PUT',
            url: `/api/group-zones/${groupZone._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)
        const updatedGroupZone = await updateResp.json()
        expect(updatedGroupZone.name).toBe("Updated Group Zone")

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/group-zones/${updatedGroupZone._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedGroupZone = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedGroupZone.name).toBe("Updated Group Zone")
    })

    it("should create and update partial a GroupZone and finally find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('group')

        const newGroupZone: Partial<IGroupZoneBase> = {
            ...baseGroupZoneData,
            createdBy: testSetup.rootUser._id.toString(),
            updatedBy: testSetup.rootUser._id.toString()
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/group-zones',
            payload: newGroupZone,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const groupZone = await resp.json()
        expect(resp.statusCode).toBe(200)

        const updateData: any = {
            name: "Updated Partial Zone",
            updatedBy: testSetup.rootUser._id.toString()
        }

        const updateResp = await testSetup.fastifyInstance.inject({
            method: 'PATCH',
            url: `/api/group-zones/${groupZone._id}`,
            payload: updateData,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(updateResp.statusCode).toBe(200)
        const updatedGroupZone = await updateResp.json()
        expect(updatedGroupZone.name).toBe("Updated Partial Zone")

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/group-zones/${updatedGroupZone._id}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const verifiedGroupZone = await verifyResp.json()
        expect(verifyResp.statusCode).toBe(200)
        expect(verifiedGroupZone.name).toBe("Updated Partial Zone")
    })

    it("should create and delete a GroupZone", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('group')

        const newGroupZone: Partial<IGroupZoneBase> = {
            ...baseGroupZoneData,
            createdBy: testSetup.rootUser._id.toString(),
            updatedBy: testSetup.rootUser._id.toString()
        }

        const createResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/group-zones',
            payload: newGroupZone,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const createdGroupZone = await createResp.json()
        expect(createResp.statusCode).toBe(200)
        const entityId = createdGroupZone._id

        const deleteResp = await testSetup.fastifyInstance.inject({
            method: 'DELETE',
            url: `/api/group-zones/${entityId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(deleteResp.statusCode).toBe(200)
        const deleteResult = await deleteResp.json()
        expect(deleteResult.deleted).toBe(true)

        const verifyResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/group-zones/${entityId}`,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        expect(verifyResp.statusCode).toBe(404)
    })

    it("Should create and paginate GroupZones", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('group')

        const groupZoneData = [
            { ...baseGroupZoneData, name: "Group Zone 1", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseGroupZoneData, name: "Group Zone 2", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() }
        ]

        for (const data of groupZoneData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/group-zones',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/group-zones',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.total).toBe(2)
        expect(result.page).toBe(1)
        expect(result.items.some((i: any) => i.name === "Group Zone 1")).toBe(true)
        expect(result.items.some((i: any) => i.name === "Group Zone 2")).toBe(true)
    })

    it("should create and search for GroupZones", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('group')

        const groupZoneData = [
            { ...baseGroupZoneData, name: "Alpha Search Target", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseGroupZoneData, name: "Beta Search target", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() },
            { ...baseGroupZoneData, name: "Gamma Other", createdBy: testSetup.rootUser._id.toString(), updatedBy: testSetup.rootUser._id.toString() }
        ]

        for (const data of groupZoneData) {
            await testSetup.fastifyInstance.inject({
                method: 'POST',
                url: '/api/group-zones',
                payload: data,
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        }

        const searchResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/group-zones/search?search=Search',
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const searchResult = await searchResp.json()
        expect(searchResp.statusCode).toBe(200)
        expect(searchResult.length).toBe(2)
        expect(searchResult.some((c: any) => c.name === "Alpha Search Target")).toBe(true)
    })

    it("should handle error responses correctly when GroupZone is not found", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        const nonExistentId = "123456789012345678901234"

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: `/api/group-zones/${nonExistentId}`,
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
            url: '/api/group-zones'
        });
        expect(resp.statusCode).toBe(401);
    });

    it("should return 403 when creating with restricted user", async () => {
        const { accessToken } = await testSetup.basicUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/group-zones',
            payload: { ...baseGroupZoneData, name: "Forbidden", createdBy: testSetup.basicUser._id.toString(), updatedBy: testSetup.basicUser._id.toString() },
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(403);
    });

    it("should return 422 when creating with missing mandatory fields", async () => {
        const { accessToken } = await testSetup.rootUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/group-zones',
            payload: {},
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        expect(resp.statusCode).toBe(422);
    });

    it("should return 400 when providing invalid ID format", async () => {
        const { accessToken } = await testSetup.rootUserLogin();

        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/group-zones/invalid-id-format',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(resp.statusCode).toBe(400);
    });
})
