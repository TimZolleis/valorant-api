import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { useFetcher } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { searchWeapons, storeWeapons } from '~/utils/redis/weapondictionary.server';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { Modal } from '@geist-ui/core';
import { useState } from 'react';
import type { Skin } from '@prisma/client';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    await storeWeapons(user);
    const url = new URL(request.url);
    const query = url.searchParams.get('offer-query') || '';
    const skins = await searchWeapons(query);
    return json({ query, skins });
};

const AddRemindersPage = () => {
    const offerFetcher = useFetcher<typeof loader>();
    const [showModal, setShowModal] = useState(false);
    const [currentWeapon, setCurrentWeapon] = useState<Skin | undefined>(undefined);
    const [reminderName, setReminderName] = useState(currentWeapon?.displayName);

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
                    <input
                        defaultValue={currentWeapon?.displayName}
                        onChange={(event) => setReminderName(event.target.value)}
                        className={
                            'bg-transparent w-full px-3 py-1.5 font-inter border border-white/20 rounded-md text-sm'
                        }
                        placeholder={'Reminder name'}
                    />
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
                        fetch(`/api/reminder/add/${currentWeapon?.id}?name=${reminderName}`);
                        setShowModal(false);
                    }}>
                    Confirm
                </Modal.Action>
            </Modal>
            <div className={'flex flex-col mt-5'}>
                <p className={'font-inter text-title-large font-medium py-2'}>Add reminder</p>
                <Container className={'w-full lg:w-1/2  p-5'}>
                    <div>
                        <offerFetcher.Form method={'get'}>
                            <label className={'text-sm text-neutral-400 capitalize'}>
                                Search Weapon skin
                            </label>
                            <input
                                className={
                                    'w-full min-w-0 mt-2 bg-transparent border rounded-md border-white/20 px-3 py-1.5 font-inter text-white text-sm'
                                }
                                placeholder='Reaver Phantom'
                                name={'offer-query'}
                                onChange={(event) => offerFetcher.submit(event.target.form)}
                            />
                        </offerFetcher.Form>
                    </div>
                    {offerFetcher.data && (
                        <div className={'flex flex-col gap-2  mt-5'}>
                            {offerFetcher.data?.skins.map((skin) => (
                                <div
                                    className={'rounded-md border border-white/20 p-3'}
                                    key={skin.id}>
                                    <div
                                        className={
                                            'grid grid-cols-3 gap-2 items-center justify-start'
                                        }>
                                        <img className={'max-h-10'} src={skin.imageUrl} alt='' />
                                        <p className={'font-inter text-sm font-medium text-white'}>
                                            {skin.displayName}
                                        </p>
                                        <div className={'flex justify-end'}>
                                            <DefaultButton onClick={() => addReminder(skin)}>
                                                <p className={'text-black text-xs'}>Add</p>
                                            </DefaultButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
};

export default AddRemindersPage;
