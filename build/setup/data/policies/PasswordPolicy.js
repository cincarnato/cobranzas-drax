const projectPasswordPolicy = {
    minLength: 8,
    maxLength: 32,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    disallowSpaces: true,
    preventReuse: 3,
    expirationDays: null
};
export { projectPasswordPolicy };
