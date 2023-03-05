import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/utils/db/db.server';

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await prisma.user.findMany();
    const domain = new URL(request.url).host;
    const prefix = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    try {
        const errors = Promise.all(
            users.map(async (user) => {
                return fetch(`${prefix}://${domain}/api/store/check/${user.puuid}`).catch((e) => {
                    return e;
                });
            })
        );
        return json({
            message: 'All user stores checked successfully',
            errors,
        });
    } catch (e) {
        throw e;
    }
};
