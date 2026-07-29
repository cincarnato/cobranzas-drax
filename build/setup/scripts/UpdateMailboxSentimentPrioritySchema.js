import { CommonConfig, DraxConfig, LoadCommonConfigFromEnv } from "@drax/common-back";
import { pathToFileURL } from "node:url";
import MongoDb from "../../databases/MongoDB.js";
import { MailboxModel } from "../../modules/mail/models/MailboxModel.js";
const BULK_SIZE = 250;
const DEFAULT_SENTIMENTS = {
    POSITIVO: {
        emoji: "🤩",
        description: "El correo expresa conformidad, agradecimiento o una experiencia favorable.",
    },
    NEGATIVO: {
        emoji: "😡",
        description: "El correo expresa disconformidad, reclamo, enojo o frustración.",
    },
    NEUTRAL: {
        emoji: "😐",
        description: "El correo es informativo o no expresa una valoración emocional clara.",
    },
};
const DEFAULT_PRIORITIES = {
    BAJA: {
        icon: "mdi-chevron-down",
        color: "success",
        description: "No requiere respuesta inmediata y puede resolverse en flujo normal.",
    },
    MEDIA: {
        icon: "mdi-minus",
        color: "warning",
        description: "Requiere seguimiento en tiempos habituales de gestión.",
    },
    ALTA: {
        icon: "mdi-chevron-up",
        color: "error",
        description: "Requiere atención rápida por urgencia, reclamo crítico o posible impacto operativo.",
    },
};
function normalizeString(value) {
    if (typeof value !== "string") {
        return undefined;
    }
    const normalized = value.trim();
    return normalized || undefined;
}
function defaultKey(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}
function normalizeSentimentOption(option) {
    const name = typeof option === "string" ? normalizeString(option) : normalizeString(option?.name);
    if (!name) {
        return undefined;
    }
    const defaults = DEFAULT_SENTIMENTS[defaultKey(name)];
    if (typeof option === "string") {
        return {
            name,
            emoji: defaults?.emoji || "",
            description: defaults?.description || "",
        };
    }
    return {
        name,
        emoji: normalizeString(option.emoji) || defaults?.emoji || "",
        description: normalizeString(option.description) || defaults?.description || "",
    };
}
function normalizePriorityOption(option) {
    const name = typeof option === "string" ? normalizeString(option) : normalizeString(option?.name);
    if (!name) {
        return undefined;
    }
    const defaults = DEFAULT_PRIORITIES[defaultKey(name)];
    if (typeof option === "string") {
        return {
            name,
            icon: defaults?.icon || "",
            color: defaults?.color || "",
            description: defaults?.description || "",
        };
    }
    return {
        name,
        icon: normalizeString(option.icon) || defaults?.icon || "",
        color: normalizeString(option.color) || defaults?.color || "",
        description: normalizeString(option.description) || defaults?.description || "",
    };
}
function normalizeSentiments(values) {
    return Array.isArray(values)
        ? values.map(normalizeSentimentOption).filter(Boolean)
        : [];
}
function normalizePriorities(values) {
    return Array.isArray(values)
        ? values.map(normalizePriorityOption).filter(Boolean)
        : [];
}
function hasLegacyOptions(values) {
    return Array.isArray(values) && values.some((option) => typeof option === "string");
}
function hasIncompleteOptionObjects(values) {
    return Array.isArray(values) && values.some((option) => {
        if (!option || typeof option === "string") {
            return false;
        }
        return typeof option.name !== "string"
            || typeof option.description !== "string";
    });
}
function hasIncompletePriorityObjects(values) {
    return Array.isArray(values) && values.some((option) => {
        if (!option || typeof option === "string") {
            return false;
        }
        return typeof option.icon !== "string"
            || typeof option.color !== "string";
    });
}
function hasIncompleteSentimentObjects(values) {
    return Array.isArray(values) && values.some((option) => {
        if (!option || typeof option === "string") {
            return false;
        }
        return typeof option.emoji !== "string";
    });
}
async function updateMailboxSentimentPrioritySchema() {
    const operations = [];
    let scanned = 0;
    let updated = 0;
    const cursor = MailboxModel.collection
        .find({
        $or: [
            { sentiments: { $elemMatch: { $type: "string" } } },
            { priorities: { $elemMatch: { $type: "string" } } },
            { "sentiments.description": { $exists: false } },
            { "sentiments.emoji": { $exists: false } },
            { "priorities.description": { $exists: false } },
            { "priorities.icon": { $exists: false } },
            { "priorities.color": { $exists: false } },
        ],
    });
    for await (const document of cursor) {
        scanned += 1;
        const shouldUpdateSentiments = hasLegacyOptions(document.sentiments)
            || hasIncompleteOptionObjects(document.sentiments)
            || hasIncompleteSentimentObjects(document.sentiments);
        const shouldUpdatePriorities = hasLegacyOptions(document.priorities)
            || hasIncompleteOptionObjects(document.priorities)
            || hasIncompletePriorityObjects(document.priorities);
        if (!shouldUpdateSentiments && !shouldUpdatePriorities) {
            continue;
        }
        const $set = {};
        if (shouldUpdateSentiments) {
            $set.sentiments = normalizeSentiments(document.sentiments);
        }
        if (shouldUpdatePriorities) {
            $set.priorities = normalizePriorities(document.priorities);
        }
        console.info("[UpdateMailboxSentimentPrioritySchema] updating document", {
            id: document._id,
            sentiments: shouldUpdateSentiments,
            priorities: shouldUpdatePriorities,
        });
        operations.push({
            updateOne: {
                filter: { _id: document._id },
                update: { $set },
            },
        });
        if (operations.length >= BULK_SIZE) {
            const result = await MailboxModel.collection.bulkWrite(operations);
            updated += result.modifiedCount;
            operations.length = 0;
        }
    }
    if (operations.length > 0) {
        const result = await MailboxModel.collection.bulkWrite(operations);
        updated += result.modifiedCount;
    }
    console.info(`[UpdateMailboxSentimentPrioritySchema] scanned=${scanned} updated=${updated}`);
}
async function runStandalone() {
    LoadCommonConfigFromEnv();
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) === "mongo") {
        await MongoDb();
    }
    await updateMailboxSentimentPrioritySchema();
    process.exit(0);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    runStandalone().catch((error) => {
        console.error("[UpdateMailboxSentimentPrioritySchema] failed", error);
        process.exit(1);
    });
}
export default updateMailboxSentimentPrioritySchema;
export { updateMailboxSentimentPrioritySchema };
