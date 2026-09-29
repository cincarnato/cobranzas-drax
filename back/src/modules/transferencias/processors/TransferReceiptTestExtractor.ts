import {extname} from "node:path";
import {AiProviderFactory} from "@drax/ai-back";
import type {IAIProvider} from "@drax/ai-back";
import {z} from "zod";
import type {IInboundEmail} from "../../mail/interfaces/IInboundEmail.js";
import {extractTextFromPdf} from "../../mail/tools/PdfTextExtractor.js";
import {extractTextWithTesseract} from "../../mail/tools/TesseractOCR.js";
import {extractTransferEmailFallback} from "./TransferEmailFallbackExtractor.js";

type TransferReceiptTestExtractorInput = {
    buffer: Buffer;
    filename?: string;
    mimetype?: string;
};

type TransferReceiptTestExtractionSource = "AI" | "FALLBACK";

type TransferReceiptTestExtractionResult = {
    tool: "PdfTextExtractor" | "TesseractOCR";
    extractionSource: TransferReceiptTestExtractionSource;
    filename: string | null;
    mimetype: string | null;
    text: string;
    receipt: {
        transferDate: string | null;
        amount: number | null;
        operationNumber: string | null;
    };
    reasoning: string | null;
    aiError?: string;
};

const DEFAULT_AI_PROVIDER = "OllamaAi";

const receiptAiSchema = z.object({
    transferDate: z.string().nullable(),
    amount: z.number().nullable(),
    operationNumber: z.string().nullable(),
    reasoning: z.string().nullable(),
});

type ReceiptAiResult = z.infer<typeof receiptAiSchema>;

function resolveAiProviderName(): string {
    return process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER;
}

function isPdfFile(mimetype: string, extension: string): boolean {
    return mimetype === "application/pdf" || extension === ".pdf";
}

function isImageFile(mimetype: string, extension: string): boolean {
    return mimetype.startsWith("image/")
        || [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif", ".webp"].includes(extension);
}

function serializeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    try {
        return JSON.stringify(error);
    } catch {
        return "Unknown extraction error";
    }
}

function normalizeOperationNumber(value?: string | null): string | null {
    const normalized = value?.trim();
    if (!normalized || !/\d/.test(normalized)) {
        return null;
    }

    return normalized;
}

function normalizeDate(value?: string | null): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function buildSyntheticInboundEmail(text: string, input: TransferReceiptTestExtractorInput): IInboundEmail {
    const filename = input.filename || "comprobante";

    return {
        _id: "transfer-receipt-test",
        messageId: `transfer-receipt-test-${Date.now()}`,
        sourceChannel: "WEB_TEST",
        receivedAt: new Date(),
        subject: `Comprobante de transferencia ${filename}`,
        bodyText: text,
        normalizedText: text,
        hasAttachments: true,
        attachmentCount: 1,
        attachmentsOcrText: text,
        attachments: [{
            filename,
            filepath: filename,
            size: input.buffer.length,
            mimetype: input.mimetype,
            url: "",
        }],
        processingStatus: "PROCESSED",
    };
}

function fallbackFromText(text: string, input: TransferReceiptTestExtractorInput, aiError?: string): TransferReceiptTestExtractionResult {
    const fallback = extractTransferEmailFallback(buildSyntheticInboundEmail(text, input), aiError);
    const transfer = fallback.transfers[0];

    return {
        tool: resolveTool(input),
        extractionSource: "FALLBACK",
        filename: input.filename || null,
        mimetype: input.mimetype || null,
        text,
        receipt: {
            transferDate: normalizeDate(transfer?.transferDate),
            amount: typeof transfer?.amount === "number" ? transfer.amount : null,
            operationNumber: normalizeOperationNumber(transfer?.operationNumber),
        },
        reasoning: transfer?.reasoning || fallback.reasoning || null,
        aiError,
    };
}

function resolveTool(input: Pick<TransferReceiptTestExtractorInput, "filename" | "mimetype">): "PdfTextExtractor" | "TesseractOCR" {
    const mimetype = (input.mimetype || "").toLowerCase();
    const extension = extname(input.filename || "").toLowerCase();

    return isPdfFile(mimetype, extension) ? "PdfTextExtractor" : "TesseractOCR";
}

function parseAiOutput(output: unknown): ReceiptAiResult {
    if (typeof output === "string") {
        return receiptAiSchema.parse(JSON.parse(output));
    }

    return receiptAiSchema.parse(output);
}

async function extractReceiptFieldsWithAi(text: string, aiProvider: IAIProvider): Promise<ReceiptAiResult> {
    const response = await aiProvider.prompt({
        operationTitle: "Comprobante de transferencia",
        operationGroup: "transfer-receipt-test",
        systemPrompt: [
            "Sos un extractor de datos de comprobantes de transferencias bancarias de Argentina.",
            "Recibis texto OCR o texto extraido de un PDF, que puede tener errores.",
            "Extrae solo estos datos cuando aparezcan explicitamente: fecha del comprobante, importe e identificador de operacion/comprobante.",
            "Para transferDate devolve una fecha ISO 8601 completa si es posible.",
            "Para amount devolve un numero. En Argentina los miles suelen separarse con punto y los decimales con coma.",
            "Para operationNumber usa solo un numero, codigo, id, referencia o comprobante explicitamente rotulado.",
            "No uses una fecha u hora como operationNumber.",
            "Si un dato no aparece o es dudoso, devolvelo como null.",
        ].join("\n"),
        userInput: text,
        zodSchema: receiptAiSchema,
        toolMaxIterations: 6,
    });

    return parseAiOutput(response.output);
}

async function extractTextFromReceipt(input: TransferReceiptTestExtractorInput): Promise<string> {
    const mimetype = (input.mimetype || "").toLowerCase();
    const extension = extname(input.filename || "").toLowerCase();

    if (isPdfFile(mimetype, extension)) {
        return (await extractTextFromPdf(input.buffer)).trim();
    }

    if (isImageFile(mimetype, extension)) {
        return (await extractTextWithTesseract(input.buffer, extension)).trim();
    }

    throw new Error("Solo se admiten imagenes y PDFs.");
}

async function extractTransferReceiptTestData(
    input: TransferReceiptTestExtractorInput,
    aiProvider: IAIProvider = AiProviderFactory.instance(resolveAiProviderName())
): Promise<TransferReceiptTestExtractionResult> {
    const text = await extractTextFromReceipt(input);

    try {
        const aiResult = await extractReceiptFieldsWithAi(text, aiProvider);
        const fallback = fallbackFromText(text, input);

        return {
            tool: resolveTool(input),
            extractionSource: "AI",
            filename: input.filename || null,
            mimetype: input.mimetype || null,
            text,
            receipt: {
                transferDate: normalizeDate(aiResult.transferDate) || fallback.receipt.transferDate,
                amount: typeof aiResult.amount === "number" ? aiResult.amount : fallback.receipt.amount,
                operationNumber: normalizeOperationNumber(aiResult.operationNumber) || fallback.receipt.operationNumber,
            },
            reasoning: aiResult.reasoning || null,
        };
    } catch (error) {
        return fallbackFromText(text, input, serializeErrorMessage(error));
    }
}

export {
    extractTransferReceiptTestData,
};

export type {
    TransferReceiptTestExtractionResult,
};
