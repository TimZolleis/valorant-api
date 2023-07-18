import type { DataFunctionArgs } from '@vercel/remix';
import { defer, json, redirect } from '@vercel/remix';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { Await, Form, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import React, { Suspense, useEffect, useState } from 'react';
import { Modal } from '@geist-ui/core';
import { useNavigate } from 'react-router';
import { red } from 'kleur/colors';
import reminders from '~/routes/store/reminders';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const reminderId = requireParam('reminderId', params);

    const reminder = prisma.reminder
        .findUnique({
            where: {
                id: reminderId,
            },
        })
        .catch();
    return defer({ reminder });
};

export const action = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const formData = await request.formData();
    const reminderName = formData.get('reminderName')?.toString();
    if (!reminderName) return json({ error: 'Please provide a name for the reminder' });
    const reminderId = requireParam('reminderId', params);
    try {
        await prisma.user.update({
            where: {
                puuid: user.userData.puuid,
            },
            data: {
                reminders: {
                    update: {
                        where: {
                            id: reminderId,
                        },
                        data: {
                            name: reminderName,
                        },
                    },
                },
            },
        });
        return redirect('/store/reminders');
    } catch (e) {
        return json({ error: 'There was an error saving the reminder' });
    }
};

const EditReminderPage = () => {
    const { reminder } = useLoaderData<typeof loader>();
    const [reminderName, setReminderName] = useState<string | undefined>();
    const data = useActionData();
    const navigate = useNavigate();
    const fetcher = useFetcher<typeof action>();
    useEffect(() => {
        const reminderName = async () => {
            return await reminder;
        };
        reminderName().then((reminder) => setReminderName(reminder?.name));
    }, [reminder]);
    return (
        <Suspense>
            <Await resolve={reminder}>
                {(resolvedReminder) => (
                    <Modal visible={true}>
                        <Modal.Title>Edit reminder</Modal.Title>
                        <Modal.Content>
                            <fetcher.Form>
                                <input
                                    name={'reminderName'}
                                    onChange={(event) => setReminderName(event.target.value)}
                                    type={'text'}
                                    className={
                                        'bg-transparent w-full px-3 py-1.5  border border-white/20 rounded-md text-sm focus:outline-none'
                                    }
                                    placeholder={'Send reminder to...'}
                                    defaultValue={reminderName}
                                />
                            </fetcher.Form>
                            <div>
                                <p className={'text-xs  text-red-500 font-light mt-2'}>
                                    {fetcher.data?.error}
                                </p>
                            </div>
                        </Modal.Content>
                        <Modal.Action passive onClick={() => navigate('/store/reminders')}>
                            Go back
                        </Modal.Action>
                        <Modal.Action
                            onClick={() =>
                                fetcher.submit({ reminderName: reminderName! }, { method: 'post' })
                            }>
                            <p>Save</p>
                        </Modal.Action>
                    </Modal>
                )}
            </Await>
        </Suspense>
    );
};

export default EditReminderPage;
