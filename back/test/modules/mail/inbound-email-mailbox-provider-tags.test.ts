import {describe, expect, it} from "vitest";
import {
    isAllowedInboundEmailTag,
    normalizeInboundEmailTag,
} from "../../../src/modules/mail/providers/InboundEmailMailboxProvider";

describe("InboundEmailMailboxProvider tags", () => {
    it("normalizes stable conceptual tags", () => {
        expect(normalizeInboundEmailTag(" Regularizar deuda ")).toBe("regularizar_deuda");
        expect(normalizeInboundEmailTag("Débito automático")).toBe("debito_automatico");
        expect(normalizeInboundEmailTag("Pago/Comprobante")).toBe("pago_comprobante");
    });

    it("rejects dynamic value tags generated from email data", () => {
        expect(isAllowedInboundEmailTag("monto_25298")).toBe(false);
        expect(isAllowedInboundEmailTag("monto_95.803")).toBe(false);
        expect(isAllowedInboundEmailTag("nro_afiliado:16681628/00")).toBe(false);
        expect(isAllowedInboundEmailTag("dni_30123456")).toBe(false);
        expect(isAllowedInboundEmailTag("julio_2026")).toBe(false);
        expect(isAllowedInboundEmailTag("mail_usuario@example.com")).toBe(false);
        expect(isAllowedInboundEmailTag("usuario@example.com")).toBe(false);
    });

    it("allows reusable tags without embedded values", () => {
        expect(isAllowedInboundEmailTag("descuento")).toBe(true);
        expect(isAllowedInboundEmailTag("discrepancia_monto")).toBe(true);
        expect(isAllowedInboundEmailTag("regularizar_deuda")).toBe(true);
        expect(isAllowedInboundEmailTag("modificacion_debito_automatico")).toBe(true);
    });

    it("rejects tags that are value field names instead of concepts", () => {
        expect(isAllowedInboundEmailTag("monto")).toBe(false);
        expect(isAllowedInboundEmailTag("nro_afiliado")).toBe(false);
        expect(isAllowedInboundEmailTag("documento")).toBe(false);
        expect(isAllowedInboundEmailTag("fecha")).toBe(false);
    });
});
