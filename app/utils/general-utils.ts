import { json, redirect } from '@vercel/remix';
import { ZodError } from 'zod';
import { errors } from '~/errors/errors';
import type { DateTime } from 'luxon';
import type { FormValidationErrors } from '~/models/general-types';

export function handleActionError(error: unknown) {
    /**
     * This is to keep thrown redirects alive
     */
    if (error instanceof Response) {
        const url = error.headers.get('location');
        if (url) return redirect(url);
    }
    if (error instanceof ZodError) {
        return json({ formValidationErrors: error.formErrors.fieldErrors });
    }
    if (error instanceof Error) {
        return json({ error: error.message });
    }
    return json({ error: errors.unknown });
}

export function raise(error: string): never {
    throw new Error(error);
}

export function getSafeISOString(dateTime: DateTime) {
    return dateTime.toISO() ?? raise('Invalid DateTime');
}

export function transformValidationErrors<T>(errors: FormValidationErrors<T>) {
    const transformedErrors: { [P in keyof T]?: string } = {};
    const keys = Object.keys(errors);
    keys.forEach((key) => {
        transformedErrors[key as keyof typeof errors] = errors?.[key as keyof typeof errors]?.[0];
    });
    return transformedErrors;
}
