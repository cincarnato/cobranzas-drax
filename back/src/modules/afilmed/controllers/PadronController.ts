
import PadronServiceFactory from "../factory/services/PadronServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PadronPermissions from "../permissions/PadronPermissions.js";
import type {IPadron, IPadronBase} from "../interfaces/IPadron";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import type {FastifyReply} from "fastify";
import {BadRequestError} from "@drax/common-back";

type PadronImportBody = {
    file?: {
        filepath?: string
        filename?: string
        mimetype?: string
    }
}

class PadronController extends AbstractFastifyController<IPadron, IPadronBase, IPadronBase>   {

    constructor() {
        super(PadronServiceFactory.instance, PadronPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

    async importFile(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(PadronPermissions.Manage)

            const body = request.body as PadronImportBody
            if (!body?.file?.filepath) {
                throw new BadRequestError("Debe subir un archivo .xlsx o .csv.")
            }

            const result = await PadronServiceFactory.instance.importStoredFile(body.file)

            return reply.status(200).send(result)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default PadronController;
export {
    PadronController
}
