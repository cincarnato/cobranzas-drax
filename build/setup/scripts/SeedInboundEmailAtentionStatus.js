import { CommonConfig, DraxConfig, LoadCommonConfigFromEnv } from "@drax/common-back";
import { pathToFileURL } from "node:url";
import MongoDb from "../../databases/MongoDB.js";
import { InboundEmailModel } from "../../modules/mail/models/InboundEmailModel.js";
const DEFAULT_ATTENTION_STATUS = "PENDING";
async function seedInboundEmailAtentionStatus() {
    const filter = {
        $or: [
            { attentionStatus: { $exists: false } },
            { attentionStatus: null },
            { attentionStatus: "" },
        ],
    };
    const result = await InboundEmailModel.collection.updateMany(filter, {
        $set: {
            attentionStatus: DEFAULT_ATTENTION_STATUS,
        },
    });
    console.info("[SeedInboundEmailAtentionStatus] completed", {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        attentionStatus: DEFAULT_ATTENTION_STATUS,
    });
}
async function runStandalone() {
    LoadCommonConfigFromEnv();
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) !== "mongo") {
        console.info("[SeedInboundEmailAtentionStatus] skipped: DbEngine is not mongo");
        process.exit(0);
    }
    await MongoDb();
    await seedInboundEmailAtentionStatus();
    process.exit(0);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    runStandalone().catch((error) => {
        console.error("[SeedInboundEmailAtentionStatus] failed", error);
        process.exit(1);
    });
}
export default seedInboundEmailAtentionStatus;
export { seedInboundEmailAtentionStatus };
