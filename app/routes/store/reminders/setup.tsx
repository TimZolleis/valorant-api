import React, { useEffect, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { useNavigate } from 'react-router';
import { Modal } from '@geist-ui/core';
import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { validateEmail } from '~/utils/common/email.server';
import { prisma } from '~/utils/db/db.server';

type ActionData = {
    message?: string;
    error?: string;
};
export const action = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    if (!email) return json({ error: 'Please provide a valid email' });
    if (!validateEmail(email)) return json({ error: 'Your email has no valid format' });
    try {
        await prisma.user.update({
            where: {
                puuid: user.userData.puuid,
            },
            data: {
                reminder_email: email,
            },
        });
        return json({ message: 'success' });
    } catch (e) {
        return json({ message: 'Error setting email', error: e });
    }
};
const SetupRemindersComponent = () => {
    const [showModal, setShowModal] = useState(true);
    const [email, setEmail] = useState('');
    const fetcher = useFetcher<ActionData>();
    const navigate = useNavigate();
    useEffect(() => {
        if (fetcher.data && fetcher.data.message === 'success') {
            navigate('/store/reminders');
        }
    }, [fetcher, fetcher.data]);
    return (
        <div>
            <fetcher.Form method={'post'}>
                <Modal visible={showModal} onClose={() => setShowModal(false)}>
                    <Modal.Title>Set Reminder email</Modal.Title>
                    <Modal.Content>
                        <p className={'mb-2 font-inter text-neutral-600 text-sm'}>
                            In order to receive reminders, you are required to set an email where a
                            notification can be sent to
                        </p>
                        <input
                            onChange={(event) => setEmail(event.target.value)}
                            name={'email'}
                            type={'email'}
                            required={true}
                            className={
                                'bg-transparent w-full px-3 py-1.5 font-inter border border-white/20 rounded-md text-sm focus:outline-none'
                            }
                            placeholder={'Send reminder to...'}
                        />
                        <div>
                            <p className={'text-xs font-inter text-red-500 font-light mt-2'}>
                                {fetcher.data?.error}
                            </p>
                        </div>
                    </Modal.Content>
                    <Modal.Action passive onClick={() => navigate('/store/reminders')}>
                        Go back
                    </Modal.Action>
                    <Modal.Action onClick={() => fetcher.submit({ email }, { method: 'post' })}>
                        Confirm
                    </Modal.Action>
                </Modal>
            </fetcher.Form>
        </div>
    );
};

export default SetupRemindersComponent;
