
enum InboundEmailPermissions {

    Create = "inboundemail:create",
    Update = "inboundemail:update",
    Delete = "inboundemail:delete",
    View = "inboundemail:view",
    Manage = "inboundemail:manage",
    Assign = "inboundemail:assign",
    AssignToMe = "inboundemail:assign-to-me",
    Reopen = "inboundemail:reopen"

}

export { InboundEmailPermissions };
export default InboundEmailPermissions;
