import type { DataFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { requireParam } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';

export const action = async ({ request, params }: DataFunctionArgs) => {
    const reminderId = requireParam('reminderId', params);
    try {
        await prisma.reminder.delete({
            where: {
                id: reminderId,
            },
        });
        return redirect('/store/reminders');
    } catch (e) {
        return json({ error: 'There was an error deleting the reminder' });
    }
};
