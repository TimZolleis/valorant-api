import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { useFetcher } from '@remix-run/react';
import { searchWeapons, storeWeapons } from '~/utils/redis/weapondictionary.server';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { Modal } from '@geist-ui/core';
import { useEffect, useState } from 'react';
import type { Skin } from '@prisma/client';
import { getItembyItemId } from '~/utils/store/storeoffer.server';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    await storeWeapons(user);
    const url = new URL(request.url);
    const query = url.searchParams.get('offer-query') || '';
    const skins = await searchWeapons(query);
    return json({ query, skins });
};

export const action = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const formData = await request.formData();
    const reminderName = formData.get('name')?.toString();
    const offerId = formData.get('offerId')?.toString();
    if (!reminderName) {
        return json({ error: 'Provide a reminder name' });
    }
    if (!offerId) {
        return json({ error: 'Please provide an offer id' });
    }

    const item = await getItembyItemId(offerId);
    prisma.user
        .update({
            where: {
                puuid: user.userData.puuid,
            },
            data: {
                reminders: {
                    upsert: {
                        where: {
                            offerId,
                        },
                        create: {
                            name: reminderName || item.displayName,
                            offerId,
                            createdAt: DateTime.now().toSeconds().toString(),
                        },
                        update: {
                            name: reminderName || item.displayName,
                            offerId,
                        },
                    },
                },
            },
        })
        .catch();

    return json({ message: 'Reminder added' });
};

const AddRemindersPage = () => {
    const offerFetcher = useFetcher<typeof loader>();
    const addOfferFetcher = useFetcher();
    const [showModal, setShowModal] = useState(false);
    const [currentWeapon, setCurrentWeapon] = useState<Skin | undefined>(undefined);
    const [reminderName, setReminderName] = useState(currentWeapon?.displayName);

    useEffect(() => {
        setReminderName(currentWeapon?.displayName);
    }, [currentWeapon]);

    function addReminder(skin: Skin) {
        setCurrentWeapon(skin);
        setShowModal(true);
    }

    return (
        <>
            <Modal visible={showModal} onClose={() => setShowModal(false)}>
                <Modal.Title>Set Reminder</Modal.Title>
                <Modal.Content>
                    <label className={'text-sm text-neutral-400 capitalize'}>Reminder name</label>
                    <addOfferFetcher.Form>
                        <input
                            name={'reminder_name'}
                            defaultValue={currentWeapon?.displayName}
                            onChange={(event) => setReminderName(event.target.value)}
                            className={
                                'bg-transparent w-full px-3 py-1.5 font-inter border border-white/20 rounded-md text-sm'
                            }
                            placeholder={'Reminder name'}
                        />
                    </addOfferFetcher.Form>
                    <p className={'mt-2'}>
                        Do you really want to set a reminder for{' '}
                        <span className={'font-semibold'}> {currentWeapon?.displayName}</span>?
                    </p>
                </Modal.Content>
                <Modal.Action passive onClick={() => setShowModal(false)}>
                    Cancel
                </Modal.Action>
                <Modal.Action
                    onClick={() => {
                        addOfferFetcher.submit(
                            { name: reminderName!, offerId: currentWeapon?.id! },
                            { method: 'post' }
                        );
                        setShowModal(false);
                    }}>
                    Confirm
                </Modal.Action>
            </Modal>
            <div className={'flex flex-col mt-5'}>
                <p className={'font-inter text-title-large font-medium py-2'}>Add reminder</p>
                <div className={'flex flex-col'}>
                    <div>
                        <offerFetcher.Form method={'get'}>
                            <div
                                className={
                                    'flex gap-2 items-center w-full min-w-0 mt-2 border rounded-md border-white/20 px-3 py-2 font-inter text-white text-sm'
                                }>
                                <img className={'h-4'} src={'/resources/icons/search.svg'}></img>
                                <input
                                    className={
                                        'border-none focus:outline-none bg-transparent placeholder:text-zinc-400'
                                    }
                                    placeholder='Search weapon skin...'
                                    name={'offer-query'}
                                    onChange={(event) => offerFetcher.submit(event.target.form)}
                                />
                            </div>
                            <p className={'font-inter mt-2 text-sm text-zinc-400'}>
                                {' '}
                                {offerFetcher.data?.skins.length || '0'} Results
                            </p>
                        </offerFetcher.Form>
                    </div>
                    {offerFetcher.data && (
                        <div className={'flex flex-col gap-2 mt-5'}>
                            {offerFetcher.data?.skins.map((skin) => (
                                <div
                                    className={'rounded-md border border-white/20 p-3'}
                                    key={skin.id}>
                                    <div className={'flex gap-10 items-center justify-between'}>
                                        <div>
                                            <div
                                                className={
                                                    'border border-white/10 p-4 bg-neutral-900/50 rounded-md'
                                                }>
                                                <img
                                                    className={'max-h-10'}
                                                    src={skin.imageUrl}
                                                    alt=''
                                                />
                                            </div>
                                            <div className={'flex items-center'}>
                                                <p
                                                    className={
                                                        'font-inter font-medium text-sm text-white mt-3'
                                                    }>
                                                    {skin.displayName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={'flex justify-end'}>
                                            <DefaultButton onClick={() => addReminder(skin)}>
                                                <span
                                                    className={
                                                        'text-black text-xs flex items-center gap-2'
                                                    }>
                                                    <img
                                                        className={'h-2'}
                                                        src='/resources/icons/plus.svg'
                                                        alt=''
                                                    />
                                                    Add reminder
                                                </span>
                                            </DefaultButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AddRemindersPage;
