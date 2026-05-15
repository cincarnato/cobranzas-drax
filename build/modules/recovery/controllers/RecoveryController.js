import { createReadStream } from "node:fs";
import { basename } from "node:path";
import RecoveryPermissions from "../permissions/RecoveryPermissions.js";
import RecoveryService from "../services/RecoveryService.js";
class RecoveryController {
    constructor() {
        this.service = new RecoveryService();
    }
    async dump(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Dump);
            const body = request.body;
            const result = await this.service.dump(body?.masterPassword || "");
            return reply.status(200).send({
                success: true,
                message: "Dump generado correctamente.",
                ...result,
            });
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo generar el dump.");
        }
    }
    async restore(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Restore);
            const body = request.body;
            const result = await this.service.restore(body?.masterPassword || "", body?.archivePath || "", body?.drop !== false);
            return reply.status(200).send({
                success: true,
                message: "Restore ejecutado correctamente.",
                ...result,
            });
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo ejecutar el restore.");
        }
    }
    async download(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Dump);
            const query = request.query;
            const archivePath = await this.service.resolveDownloadPath(query?.archivePath || "");
            const filename = basename(archivePath);
            return reply
                .header("Content-Type", "application/gzip")
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(createReadStream(archivePath));
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo descargar el dump.");
        }
    }
    async restoreUpload(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.Restore);
            const uploadedFile = await request.file();
            if (!uploadedFile) {
                return reply.status(400).send({
                    success: false,
                    error: "RECOVERY_UPLOAD_REQUIRED",
                    message: "Debe subir un archivo de dump.",
                });
            }
            const masterPassword = this.getMultipartField(uploadedFile, "masterPassword");
            const drop = this.getMultipartField(uploadedFile, "drop") !== "false";
            const archivePath = await this.service.saveUploadedArchive(uploadedFile.file, uploadedFile.filename);
            const result = await this.service.restore(masterPassword, archivePath, drop);
            return reply.status(200).send({
                success: true,
                message: "Restore ejecutado correctamente.",
                ...result,
            });
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo ejecutar el restore.");
        }
    }
    sendError(reply, error, fallbackMessage) {
        return reply.status(error?.statusCode || 500).send({
            success: false,
            error: "RECOVERY_OPERATION_ERROR",
            message: error?.message || fallbackMessage,
        });
    }
    getMultipartField(uploadedFile, fieldName) {
        const field = uploadedFile?.fields?.[fieldName];
        return String(field?.value || "");
    }
}
export default RecoveryController;
export { RecoveryController };
