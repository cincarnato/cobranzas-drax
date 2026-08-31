import type {IInboundEmail} from "../../mail/interfaces/IInboundEmail.js";

type TransferEmailFallbackCurrency = "ARS" | "USD" | "EUR" | "OTHER";

type TransferEmailFallbackItem = {
    amount: number | null;
    currency: TransferEmailFallbackCurrency | null;
    transferDate: string | null;
    operationNumber: string | null;
    concept: string | null;
    originName: string | null;
    originAccount: string | null;
    originCbu: string | null;
    originAlias: string | null;
    originBank: string | null;
    destinationName: string | null;
    destinationAccount: string | null;
    destinationCbu: string | null;
    destinationAlias: string | null;
    destinationBank: string | null;
    affiliateName: string | null;
    affiliateEmail: string | null;
    affiliateDocumentNumber: string | null;
    emailDocumentNumber: string | null;
    additionalAffiliates: [];
    needsHumanReview: boolean;
    hasAdditionalInquiry: boolean;
    reasoning: string;
};

type TransferEmailFallbackResult = {
    isTransferProof: boolean;
    transfers: TransferEmailFallbackItem[];
    needsHumanReview: boolean;
    hasAdditionalInquiry: boolean;
    reasoning: string;
    extractionSource: "FALLBACK";
    aiError?: string;
};

const TRANSFER_KEYWORD_REGEX = /\b(transferencia|transferido|transferiste|transf\.?|tef|env[ií]o de dinero|recibiste una transferencia|comprobante de transferencia|aviso de transferencia)\b/i;
const BANK_EVIDENCE_REGEX = /\b(cbu|cvu|alias|cuenta origen|cuenta destino|n[uú]mero de operaci[oó]n|nro\.?\s*operaci[oó]n|comprobante|referencia|transacci[oó]n|acreditad[oa]|debitad[oa])\b/i;

function extractTransferEmailFallback(inboundEmail: IInboundEmail, aiError?: string): TransferEmailFallbackResult {
    const text = buildSearchText(inboundEmail);
    const amount = extractAmount(text);
    const operationNumber = extractOperationNumber(text);
    const transferDate = extractTransferDate(text);
    const originName = extractName(text, ["titular origen", "ordenante", "remitente", "pagador", "de"]);
    const destinationName = extractName(text, ["titular destino", "beneficiario", "destinatario", "para"]);
    const originCbu = extractLabeledCbu(text, "origen") || extractFirstCbu(text);
    const destinationCbu = extractLabeledCbu(text, "destino");
    const originAccount = extractLabeledValue(text, ["cuenta origen", "cuenta debito", "cuenta débito"]);
    const destinationAccount = extractLabeledValue(text, ["cuenta destino", "cuenta credito", "cuenta crédito"]);
    const originAlias = extractLabeledAlias(text, "origen") || extractFirstAlias(text);
    const destinationAlias = extractLabeledAlias(text, "destino");
    const affiliateDocumentNumber = extractDocumentNumber(text);
    const affiliateEmail = extractEmail(text);
    const affiliateName = extractName(text) || inboundEmail.customer?.name || inboundEmail.fromName || null;
    const currency = extractCurrency(text, amount);
    const concept = extractLabeledValue(text, ["concepto", "motivo", "descripcion", "detalle"]);
    const originBank = extractBank(text, ["banco origen", "entidad origen", "desde banco"]);
    const destinationBank = extractBank(text, ["banco destino", "entidad destino", "hacia banco"]);

    const hasTransferKeyword = TRANSFER_KEYWORD_REGEX.test(text);
    const hasBankEvidence = BANK_EVIDENCE_REGEX.test(text);
    const hasTransferData = Boolean(amount || operationNumber || originCbu || destinationCbu || originAlias || destinationAlias);
    const isTransferProof = hasTransferKeyword && (hasBankEvidence || hasTransferData);

    if (!isTransferProof) {
        return {
            isTransferProof: false,
            transfers: [],
            needsHumanReview: true,
            hasAdditionalInquiry: false,
            reasoning: "Fallback sin IA: no se encontraron señales suficientes de comprobante o aviso de transferencia.",
            extractionSource: "FALLBACK",
            aiError,
        };
    }

    return {
        isTransferProof: true,
        transfers: [{
            amount,
            currency,
            transferDate,
            operationNumber,
            concept,
            originName,
            originAccount,
            originCbu,
            originAlias,
            originBank,
            destinationName,
            destinationAccount,
            destinationCbu,
            destinationAlias,
            destinationBank,
            affiliateName,
            affiliateEmail,
            affiliateDocumentNumber,
            emailDocumentNumber: affiliateDocumentNumber,
            additionalAffiliates: [],
            needsHumanReview: true,
            hasAdditionalInquiry: false,
            reasoning: "Fallback sin IA: transferencia detectada con expresiones regulares. Requiere auditoria humana.",
        }],
        needsHumanReview: true,
        hasAdditionalInquiry: false,
        reasoning: "Fallback sin IA: transferencia detectada con expresiones regulares. Requiere auditoria humana.",
        extractionSource: "FALLBACK",
        aiError,
    };
}

function buildSearchText(inboundEmail: IInboundEmail): string {
    return [
        inboundEmail.subject,
        inboundEmail.bodyText,
        inboundEmail.normalizedText,
        inboundEmail.attachmentsOcrText,
    ].filter(Boolean).join("\n");
}

function extractAmount(text: string): number | null {
    const patterns = [
        /(?:importe|monto|total|valor|por)\s*(?:de)?\s*(?:ars|pesos|\$)?\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:,[0-9]{1,2})?)/i,
        /(?:ars|pesos|\$)\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:,[0-9]{1,2})?)/i,
        /(?:usd|u\$s|d[oó]lares?)\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:,[0-9]{1,2})?)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        const value = match?.[1] ? parseArgentinaAmount(match[1]) : null;
        if (value !== null) {
            return value;
        }
    }

    return null;
}

function parseArgentinaAmount(value: string): number | null {
    const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : null;
}

function extractCurrency(text: string, amount: number | null): TransferEmailFallbackCurrency | null {
    if (/\b(usd|u\$s|d[oó]lares?)\b/i.test(text)) {
        return "USD";
    }
    if (/\b(eur|euros?)\b/i.test(text)) {
        return "EUR";
    }
    if (amount !== null || /\b(ars|pesos?)\b|\$/i.test(text)) {
        return "ARS";
    }
    return null;
}

function extractTransferDate(text: string): string | null {
    const match = text.match(/(?:fecha(?:\s+de\s+transferencia|\s+operaci[oó]n)?|realizad[ao]\s+el)?\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s*(?:-|,)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/i);
    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    const hour = Number(match[4] || 0);
    const minute = Number(match[5] || 0);
    const second = Number(match[6] || 0);
    const date = new Date(year, month - 1, day, hour, minute, second);

    if (
        Number.isNaN(date.getTime())
        || date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
    ) {
        return null;
    }

    return date.toISOString();
}

function extractOperationNumber(text: string): string | null {
    const match = text.match(/(?:n[uú]mero\s+de\s+)?(?:operaci[oó]n|comprobante|referencia|transacci[oó]n|id)\s*(?:nro\.?|n[uú]mero|n[º°#])?\s*:?\s*([A-Z0-9][A-Z0-9-]{4,})/i);
    return match?.[1] || null;
}

function extractFirstCbu(text: string): string | null {
    const match = text.match(/\b(?:cbu|cvu)\b\D{0,20}(\d(?:[\s-]?\d){21})/i);
    return normalizeLongNumber(match?.[1], 22);
}

function extractLabeledCbu(text: string, label: "origen" | "destino"): string | null {
    const match = text.match(new RegExp(`\\b(?:cbu|cvu)\\s+${label}\\b\\D{0,20}(\\d(?:[\\s-]?\\d){21})`, "i"));
    return normalizeLongNumber(match?.[1], 22);
}

function extractLabeledAlias(text: string, label: "origen" | "destino"): string | null {
    const match = text.match(new RegExp(`\\balias\\s+${label}\\b\\s*:?\\s*([a-z0-9][a-z0-9.-]{4,})`, "i"));
    return match?.[1] || null;
}

function extractFirstAlias(text: string): string | null {
    const match = text.match(/\balias\b\s*:?\s*([a-z0-9][a-z0-9.-]{4,})/i);
    return match?.[1] || null;
}

function extractDocumentNumber(text: string): string | null {
    const match = text.match(/\b(?:dni|cuil|cuit|documento)\b\D{0,12}(\d{2}[-.\s]?\d{8}[-.\s]?\d|\d{7,8})\b/i);
    const digits = match?.[1]?.replace(/\D/g, "");
    if (!digits) {
        return null;
    }
    return digits.length === 11 ? digits.slice(2, 10) : digits;
}

function extractEmail(text: string): string | null {
    return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
}

function extractName(text: string, labels: string[] = ["titular", "ordenante", "remitente", "pagador"]): string | null {
    for (const label of labels) {
        const match = text.match(new RegExp(`\\b${label}\\b\\s*:?\\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ.' -]{4,80})`));
        const value = match?.[1]?.trim().replace(/\s{2,}/g, " ");
        if (value) {
            return value;
        }
    }
    return null;
}

function extractBank(text: string, labels: string[]): string | null {
    return extractLabeledValue(text, labels);
}

function extractLabeledValue(text: string, labels: string[]): string | null {
    for (const label of labels) {
        const match = text.match(new RegExp(`\\b${label}\\b\\s*:?\\s*([^\\n\\r]{2,80})`, "i"));
        const value = match?.[1]?.trim().replace(/\s{2,}/g, " ");
        if (value) {
            return value;
        }
    }
    return null;
}

function normalizeLongNumber(value: string | undefined, expectedLength: number): string | null {
    const digits = value?.replace(/\D/g, "");
    return digits?.length === expectedLength ? digits : null;
}

export {
    extractTransferEmailFallback,
};
export type {
    TransferEmailFallbackResult,
    TransferEmailFallbackItem,
};
