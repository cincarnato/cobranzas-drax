import {describe, expect, it} from "vitest";
import {InboundMailTransferProcessor} from "../../../src/modules/transferencias/processors/InboundMailTransferProcessor.js";
import {extractTransferEmailFallback} from "../../../src/modules/transferencias/processors/TransferEmailFallbackExtractor.js";
import {InboundEmailSchema} from "../../../src/modules/mail/schemas/InboundEmailSchema.js";

describe("InboundMailTransferProcessor", () => {
    const processor = new InboundMailTransferProcessor({} as never, {} as never, {} as never, {} as never);

    it("clears operationNumber when AI returns a date-time string", () => {
        expect(
            processor["normalizeOperationNumber"]("08/01/2026 - 11:17:34hs")
        ).toBeUndefined();
    });

    it("keeps operationNumber when it looks like an explicit reference", () => {
        expect(
            processor["normalizeOperationNumber"]("000123456789")
        ).toBe("000123456789");
    });

    it("extracts basic transfer data with regex fallback", () => {
        const result = extractTransferEmailFallback({
            _id: "email-id",
            messageId: "message-id",
            sourceChannel: "EMAIL",
            receivedAt: new Date("2026-01-08T14:17:00.000Z"),
            processingStatus: "PROCESSED",
            subject: "Comprobante de transferencia",
            bodyText: [
                "Se realizo una transferencia por $ 12.345,67",
                "Fecha 08/01/2026 - 11:17:34hs",
                "Numero de operacion: 000123456789",
                "CBU origen: 2850590940090418135201",
                "DNI: 30111222",
            ].join("\n"),
        });

        expect(result.isTransferProof).toBe(true);
        expect(result.transfers[0].amount).toBe(12345.67);
        expect(result.transfers[0].operationNumber).toBe("000123456789");
        expect(result.transfers[0].originCbu).toBe("2850590940090418135201");
        expect(result.transfers[0].affiliateDocumentNumber).toBe("30111222");
    });

    it("uses regex fallback when AI extraction fails", async () => {
        const fallbackProcessor = new InboundMailTransferProcessor(
            {} as never,
            {} as never,
            {prompt: async () => {
                throw new Error("AI unavailable");
            }} as never,
            {findByAnyStrategy: async () => []} as never
        );

        const payloads = await fallbackProcessor["buildTransferEmailPayloads"]({
            _id: "email-id",
            messageId: "message-id",
            sourceChannel: "EMAIL",
            receivedAt: new Date("2026-01-08T14:17:00.000Z"),
            processingStatus: "PROCESSED",
            fromName: "Juan Perez",
            fromEmail: "juan@example.com",
            subject: "Comprobante de transferencia",
            bodyText: "Transferencia realizada por $ 10.000,00. Operacion: 000123456789. CBU: 2850590940090418135201",
        });

        expect(payloads).toHaveLength(1);
        expect(payloads[0].aiStatus).toBe("PROCESADO_SIN_IA");
        expect(payloads[0].needsHumanReview).toBe(true);
        expect(payloads[0].amount).toBe(10000);
        expect(payloads[0].aiError).toBe("AI unavailable");
    });

    it("accepts inbound emails assigned to users without name in output validation", () => {
        const parsed = InboundEmailSchema.parse({
            _id: "email-id",
            messageId: "message-id",
            sourceChannel: "EMAIL",
            receivedAt: new Date("2026-01-08T14:17:00.000Z"),
            processingStatus: "PROCESSED",
            customer: {},
            assignedTo: {
                _id: "user-id",
                username: "operator",
            },
            createdAt: new Date("2026-01-08T14:17:00.000Z"),
            updatedAt: new Date("2026-01-08T14:17:00.000Z"),
        });

        expect(parsed.assignedTo?.username).toBe("operator");
    });
});
