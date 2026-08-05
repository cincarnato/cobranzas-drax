import { DraxConfig, CommonConfig, MongooseConector, LoadCommonConfigFromEnv } from "@drax/common-back";
import { LoadIdentityConfigFromEnv, SetProjectPasswordPolicy } from "@drax/identity-back";
import InitializePermissions from "./InitializePermissions.js";
import CreateRootUserAndAdminRole from "./CreateRootUserAndAdminRole.js";
import CreateSystemRoles from "./CreateSystemRoles.js";
import InitializeSettings from "./InitializeSettings.js";
import InitializeAudit from "./InitializeAudit.js";
import { projectPasswordPolicy } from "./data/policies/PasswordPolicy.js";
import updateMailboxSentimentPrioritySchema from "./scripts/UpdateMailboxSentimentPrioritySchema.js";
import seedInboundEmailAtentionStatus from "./scripts/SeedInboundEmailAtentionStatus.js";
import updateInboundEmailManagementIndexes from "./scripts/UpdateInboundEmailManagementIndexes.js";
async function SetupDrax() {
    //Load Identity Drax Config from enviroment variables
    LoadCommonConfigFromEnv();
    LoadIdentityConfigFromEnv();
    //Setup MongoDB connection if needed
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) === 'mongo') {
        const mongooseUri = DraxConfig.getOrLoad(CommonConfig.MongoDbUri);
        const mongooseConector = new MongooseConector(mongooseUri);
        mongooseConector.connect();
    }
    //Setup Permissions
    InitializePermissions();
    //Set a custom project password policy
    SetProjectPasswordPolicy(projectPasswordPolicy);
    //Setup Audit
    InitializeAudit();
    //Setup Settings
    await InitializeSettings();
    //Create Root User and Admin Role
    await CreateRootUserAndAdminRole();
    await CreateSystemRoles();
    //Scripts
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) === 'mongo') {
        await updateMailboxSentimentPrioritySchema();
        await seedInboundEmailAtentionStatus();
        await updateInboundEmailManagementIndexes();
    }
}
export default SetupDrax;
export { SetupDrax };
