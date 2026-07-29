var InboundEmailPermissions;
(function (InboundEmailPermissions) {
    InboundEmailPermissions["Create"] = "inboundemail:create";
    InboundEmailPermissions["Update"] = "inboundemail:update";
    InboundEmailPermissions["Delete"] = "inboundemail:delete";
    InboundEmailPermissions["View"] = "inboundemail:view";
    InboundEmailPermissions["Manage"] = "inboundemail:manage";
    InboundEmailPermissions["Assign"] = "inboundemail:assign";
    InboundEmailPermissions["AssignToMe"] = "inboundemail:assign-to-me";
    InboundEmailPermissions["Reopen"] = "inboundemail:reopen";
})(InboundEmailPermissions || (InboundEmailPermissions = {}));
export { InboundEmailPermissions };
export default InboundEmailPermissions;
