const projectPasswordPolicy = {
    minLength: 6,
    maxLength: 32,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: true,
    requireSpecialChar: false,
    allowedSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
    disallowSpaces: true,
    preventReuse: 3,
    expirationDays: null
};
export { projectPasswordPolicy };
