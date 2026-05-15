import {CreateOrUpdateRole} from "@drax/identity-back";
import operatorRole from "./data/roles/cobrador-role.js";
import llamadorRole from "./data/roles/llamador-role.js";
import operadorBajaRole from "./data/roles/operador-baja-role.js";
import supervisorBajaRole from "./data/roles/supervisor-baja-role.js";

async function CreateSystemRoles(){
    await CreateOrUpdateRole(operatorRole)
    await CreateOrUpdateRole(llamadorRole)
    await CreateOrUpdateRole(operadorBajaRole)
    await CreateOrUpdateRole(supervisorBajaRole)
    //await CreateOrUpdateRole(supervisorRole)
}

export default CreateSystemRoles

export {
    CreateSystemRoles
}
