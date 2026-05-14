import type {IPasswordPolicy} from "@drax/identity-share";

const projectPasswordPolicy: IPasswordPolicy = {
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
}

export {
    projectPasswordPolicy
}
