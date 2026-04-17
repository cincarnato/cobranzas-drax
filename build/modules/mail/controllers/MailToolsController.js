import { access } from "node:fs/promises";
import { extname } from "node:path";
import { extractTextWithTesseract } from "../tools/TesseractOCR.js";
import { extractTextFromPdf } from "../tools/PdfTextExtractor.js";
class MailToolsController {
    async extractText(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission("mailbox:manage");
            const file = request.body?.file;
            if (!file?.filepath) {
                return reply.status(400).send({
                    error: "MAIL_TOOLS_FILE_REQUIRED",
                    message: "Debe enviar un archivo con filepath.",
                });
            }
            await access(file.filepath);
            const filename = file.filename || "";
            const mimetype = (file.mimetype || "").toLowerCase();
            const extension = extname(filename || file.filepath).toLowerCase();
            let tool = "";
            let text = "";
            if (this.isPdfFile(mimetype, extension)) {
                tool = "PdfTextExtractor";
                text = await extractTextFromPdf(file.filepath);
            }
            else if (this.isImageFile(mimetype, extension)) {
                tool = "TesseractOCR";
                text = await extractTextWithTesseract(file.filepath, extension);
            }
            else {
                return reply.status(400).send({
                    error: "MAIL_TOOLS_UNSUPPORTED_FILE",
                    message: "Solo se admiten imagenes y PDFs.",
                });
            }
            return reply.status(200).send({
                tool,
                mimetype: file.mimetype || null,
                filename: file.filename || null,
                filepath: file.filepath,
                text: text.trim(),
            });
        }
        catch (error) {
            return reply.status(500).send({
                error: "MAIL_TOOLS_EXTRACT_ERROR",
                message: error?.message || "No se pudo extraer el texto del archivo.",
            });
        }
    }
    isPdfFile(mimetype, extension) {
        return mimetype === "application/pdf" || extension === ".pdf";
    }
    isImageFile(mimetype, extension) {
        if (mimetype.startsWith("image/")) {
            return true;
        }
        return [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif", ".webp"].includes(extension);
    }
}
export default MailToolsController;
export { MailToolsController };
