import { TransferEmailModel } from "../../modules/transferencias/models/TransferEmailModel.js";
const BULK_SIZE = 250;
function normalizeString(value) {
    if (typeof value !== "string") {
        return undefined;
    }
    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : undefined;
}
function buildAffiliates(document) {
    const primaryAffiliate = {
        name: normalizeString(document.affiliateName),
        documentNumber: normalizeString(document.affiliateDocumentNumber),
        month: normalizeString(document.month),
        observations: normalizeString(document.observations),
    };
    const extraAffiliates = (document.additionalAffiliates || []).map((affiliate) => ({
        name: normalizeString(affiliate?.name),
        documentNumber: normalizeString(affiliate?.documentNumber),
    }));
    const affiliates = [primaryAffiliate, ...extraAffiliates]
        .filter((affiliate) => Object.values(affiliate).some((value) => value !== undefined));
    if (affiliates.length === 1 && typeof document.amount === "number" && Number.isFinite(document.amount)) {
        affiliates[0].amount = document.amount;
    }
    return affiliates;
}
async function transferEmailUpdateSchema() {
    const operations = [];
    let scanned = 0;
    let updated = 0;
    const cursor = TransferEmailModel.find({}).lean().cursor();
    for await (const document of cursor) {
        if (!document._id) {
            continue;
        }
        scanned += 1;
        const affiliates = buildAffiliates(document);
        const aiStatus = document.needsHumanReview
            ? "PROCESADO_CON_DUDAS"
            : "PROCESADO_CONFIABLE";
        console.info("[TransferEmailUpdateSchema] updating document", {
            id: document._id,
            affiliateName: document.affiliateName,
            affiliateDocumentNumber: document.affiliateDocumentNumber,
            additionalAffiliatesCount: document.additionalAffiliates?.length || 0,
            amount: document.amount,
            needsHumanReview: document.needsHumanReview,
        });
        operations.push({
            updateOne: {
                filter: { _id: document._id },
                update: {
                    $set: {
                        affiliates,
                        aiStatus,
                        humanStatus: "PENDIENTE",
                        status: "PENDIENTE_AUDITORIA",
                    },
                    $unset: {
                        affiliateName: "",
                        affiliateEmail: "",
                        affiliateDocumentNumber: "",
                        additionalAffiliates: "",
                        month: "",
                        observations: "",
                    },
                },
            },
        });
        if (operations.length >= BULK_SIZE) {
            const result = await TransferEmailModel.bulkWrite(operations);
            updated += result.modifiedCount;
            operations.length = 0;
        }
    }
    if (operations.length > 0) {
        const result = await TransferEmailModel.bulkWrite(operations);
        updated += result.modifiedCount;
    }
    console.info(`[TransferEmailUpdateSchema] scanned=${scanned} updated=${updated}`);
}
export default transferEmailUpdateSchema;
export { transferEmailUpdateSchema };
