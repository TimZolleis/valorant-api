import { json, redirect } from '@vercel/remix';
import { ZodError } from 'zod';
import { errors } from '~/errors/errors';

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
