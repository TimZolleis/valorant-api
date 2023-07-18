import { z } from 'zod';

export const errors = {
    unknown: 'An unknown error has occurred. Please try again later.',
    general: {
        required: 'This field is required.',
    },
    login: {
        usernameRequired: 'Please enter your username.',
        passwordRequired: 'Please enter your password.',
        usernameInvalid: 'Please enter a valid username.',
        passwordInvalid: 'Please enter a valid password.',
    },
};
const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type && issue.received === 'undefined') {
        return { message: errors.general.required };
    }
    return { message: ctx.defaultError };
};
z.setErrorMap(zodErrorMap);
