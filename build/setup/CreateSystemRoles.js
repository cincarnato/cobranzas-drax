import { CreateOrUpdateRole } from "@drax/identity-back";
import operatorRole from "./data/roles/cobrador-role.js";
import llamadorRole from "./data/roles/llamador-role.js";
async function CreateSystemRoles() {
    await CreateOrUpdateRole(operatorRole);
    await CreateOrUpdateRole(llamadorRole);
    //await CreateOrUpdateRole(supervisorRole)
}
export default CreateSystemRoles;
export { CreateSystemRoles };
