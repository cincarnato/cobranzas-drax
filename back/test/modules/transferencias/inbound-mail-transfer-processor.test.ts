import {describe, expect, it} from "vitest";
import {InboundMailTransferProcessor} from "../../../src/modules/transferencias/processors/InboundMailTransferProcessor.js";

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
});
