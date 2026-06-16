
import {DraxConfig, CommonConfig, mongoose} from "@drax/common-back";
import MongoDb from "../../databases/MongoDB.js";

const COLLECTION_NAME = "TransferEmail";
const BULK_SIZE = 250;

type LegacyAffiliate = {
    name?: string | null;
    email?: string | null;
    documentNumber?: string | null;
}

type LegacyTransferEmail = {
    _id: any;
    amount?: number | null;
    affiliateName?: string | null;
    affiliateEmail?: string | null;
    affiliateDocumentNumber?: string | null;
    additionalAffiliates?: LegacyAffiliate[] | null;
    month?: string | null;
    observations?: string | null;
    needsHumanReview?: boolean | null;
    affiliates?: Array<{
        name?: string;
        amount?: number;
        documentNumber?: string;
        month?: string;
        observations?: string;
    }>;
}

function normalizeString(value?: string | null): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function buildAffiliates(document: LegacyTransferEmail) {
    const primaryAffiliate: {
        name?: string;
        amount?: number;
        documentNumber?: string;
        month?: string;
        observations?: string;
    } = {
        name: normalizeString(document.affiliateName),
        documentNumber: normalizeString(document.affiliateDocumentNumber),
        month: normalizeString(document.month),
        observations: normalizeString(document.observations),
    };

    const extraAffiliates: Array<{
        name?: string;
        amount?: number;
        documentNumber?: string;
        month?: string;
        observations?: string;
    }> = (document.additionalAffiliates || []).map((affiliate) => ({
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
    if (DraxConfig.get(CommonConfig.DbEngine) === "mongo") {
        await MongoDb();
    }

    const collection = mongoose.connection.collection(COLLECTION_NAME);
    const cursor = collection.find({});
    const operations: Array<any> = [];
    let scanned = 0;
    let updated = 0;

    while (await cursor.hasNext()) {
        const document = await cursor.next() as LegacyTransferEmail | null;

        if (!document?._id) {
            continue;
        }

        scanned += 1;

        const affiliates = buildAffiliates(document);
        const aiStatus = document.needsHumanReview
            ? "PROCESADO_CON_DUDAS"
            : "PROCESADO_CONFIABLE";

        operations.push({
            updateOne: {
                filter: {_id: document._id},
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
            const result = await collection.bulkWrite(operations);
            updated += result.modifiedCount;
            operations.length = 0;
        }
    }

    if (operations.length > 0) {
        const result = await collection.bulkWrite(operations);
        updated += result.modifiedCount;
    }

    console.info(`[TransferUpdateSchema] scanned=${scanned} updated=${updated}`);
    await mongoose.connection.close();
}

await transferEmailUpdateSchema();
process.exit(0);

export default transferEmailUpdateSchema;
export {transferEmailUpdateSchema}
