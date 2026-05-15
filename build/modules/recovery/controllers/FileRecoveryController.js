import { createReadStream } from "node:fs";
import { basename } from "node:path";
import RecoveryPermissions from "../permissions/RecoveryPermissions.js";
import FileRecoveryService from "../services/FileRecoveryService.js";
class FileRecoveryController {
    constructor() {
        this.service = new FileRecoveryService();
    }
    async backup(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileBackup);
            const body = request.body;
            const result = await this.service.backup(body?.masterPassword || "");
            return reply.status(200).send({
                success: true,
                message: "Backup de archivos generado correctamente.",
                ...result,
            });
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo generar el backup de archivos.");
        }
    }
    async restore(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileRestore);
            const body = request.body;
            const result = await this.service.restore(body?.masterPassword || "", body?.archivePath || "", body?.cleanTarget === true);
            return reply.status(200).send({
                success: true,
                message: "Restore de archivos ejecutado correctamente.",
                ...result,
            });
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo ejecutar el restore de archivos.");
        }
    }
    async download(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileBackup);
            const query = request.query;
            const archivePath = await this.service.resolveDownloadPath(query?.archivePath || "");
            const filename = basename(archivePath);
            return reply
                .header("Content-Type", "application/gzip")
                .header("Content-Disposition", `attachment; filename="${filename}"`)
                .send(createReadStream(archivePath));
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo descargar el backup de archivos.");
        }
    }
    async restoreUpload(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(RecoveryPermissions.FileRestore);
            const uploadedFile = await request.file();
            if (!uploadedFile) {
                return reply.status(400).send({
                    success: false,
                    error: "FILE_RECOVERY_UPLOAD_REQUIRED",
                    message: "Debe subir un archivo de backup.",
                });
            }
            const masterPassword = this.getMultipartField(uploadedFile, "masterPassword");
            const cleanTarget = this.getMultipartField(uploadedFile, "cleanTarget") === "true";
            const archivePath = await this.service.saveUploadedArchive(uploadedFile.file, uploadedFile.filename);
            const result = await this.service.restore(masterPassword, archivePath, cleanTarget);
            return reply.status(200).send({
                success: true,
                message: "Restore de archivos ejecutado correctamente.",
                ...result,
            });
        }
        catch (error) {
            return this.sendError(reply, error, "No se pudo ejecutar el restore de archivos.");
        }
    }
    sendError(reply, error, fallbackMessage) {
        return reply.status(error?.statusCode || 500).send({
            success: false,
            error: "FILE_RECOVERY_OPERATION_ERROR",
            message: error?.message || fallbackMessage,
        });
    }
    getMultipartField(uploadedFile, fieldName) {
        const field = uploadedFile?.fields?.[fieldName];
        return String(field?.value || "");
    }
}
export default FileRecoveryController;
export { FileRecoveryController };
