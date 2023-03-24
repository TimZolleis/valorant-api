import type { DataFunctionArgs } from '@vercel/remix';
import { defer, redirect } from '@vercel/remix';
import { commitClientSession, getClientSession, requireUser } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { Await, Form, Link, Outlet, useLoaderData } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { useNavigate } from 'react-router';
import React, { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { getItembyItemId } from '~/utils/store/storeoffer.server';
import type { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import type { Reminder } from '.prisma/client';
import { DateTime } from 'luxon';
import { ITEM_TYPES } from '~/config/skinlevels.';
import { Popover } from '@headlessui/react';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const userWithReminders = await prisma.user.findUnique({
        where: {
            puuid: user.userData.puuid,
        },
        include: {
            reminders: true,
        },
    });
    if (!userWithReminders) throw new Error('You do not have any reminders');
    const session = await getClientSession(request);
    if (!userWithReminders.reminder_email && !request.url.includes('setup')) {
        throw redirect('/store/reminders/setup', {
            headers: {
                'Set-Cookie': await commitClientSession(session),
            },
        });
    }
    const reminderItems = Promise.all(
        userWithReminders.reminders.map(async (reminder) => {
            return {
                reminder,
                skin: await getItembyItemId(reminder.offerId, ITEM_TYPES.SKINLEVEL),
            };
        })
    );

    return defer({ userWithReminders, reminderItems });
};

const RemindersPage = () => {
    const { userWithReminders, reminderItems } = useLoaderData<typeof loader>();
    return (
        <div>
            <Outlet />
            <div className={'flex w-full justify-between'}>
                <span className={'w-full pl-1 text-sm flex flex-col font-inter text-neutral-600'}>
                    <p>REMINDER ADDRESS</p>
                    <p className={'text-white'}>{userWithReminders.reminder_email}</p>
                </span>
                <div className={'flex w-full justify-end gap-2 items-center'}>
                    <Link to={'add'}>
                        <DefaultButton>
                            <p className={'text-black text-sm'}>Add reminder</p>
                        </DefaultButton>
                    </Link>
                    <Link to={'setup'}>
                        <DefaultButton buttonType={'secondary'}>
                            <p className={'text-sm'}>Change email</p>
                        </DefaultButton>
                    </Link>
                </div>
            </div>
            <div className={'mt-5'}>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={reminderItems}>
                        {(items) => (
                            <>
                                {items.length <= 0 && <NoRemindersComponent />}
                                {
                                    <div className={'space-y-2'}>
                                        {items.map((item) => (
                                            <ReminderCard
                                                key={item.reminder.offerId}
                                                reminder={item.reminder}
                                                skin={item.skin}></ReminderCard>
                                        ))}
                                    </div>
                                }
                            </>
                        )}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
};

const ReminderCard = ({ skin, reminder }: { skin: ValorantApiWeaponSkin; reminder: Reminder }) => {
    return (
        <Container className={'bg-black'}>
            <div className={'flex p-2 items-center'}>
                <div className={'flex-[0_0_15%] mr-5'}>
                    <img className={'max-h-10'} src={skin.displayIcon} alt='' />
                </div>
                <div className={'flex justify-between w-full items-center'}>
                    <div>
                        <p className={'font-inter font-medium text-sm text-white mt-3'}>
                            {reminder.name}
                        </p>
                        <span className={'flex text-neutral-600 text-xs'}>
                            <p>
                                ADDED{' '}
                                {DateTime.fromSeconds(parseInt(reminder.createdAt))
                                    .setLocale('de-DE')
                                    .toLocaleString()}
                            </p>
                        </span>
                    </div>
                    <ReminderOptions reminderId={reminder.id}></ReminderOptions>
                </div>
            </div>
        </Container>
    );
};

const NoRemindersComponent = () => {
    const navigate = useNavigate();

    return (
        <div className={'flex justify-center w-full'}>
            <Container className={'mt-10 lg:w-1/2 bg-black'}>
                <div className={'w-full text-center flex flex-col items-center font-inter p-5'}>
                    <div>
                        <p className={'font-medium text-title-medium'}>
                            You do no not have any reminders
                        </p>
                        <p className={'text-gray-400 font-normal text-sm'}>
                            You currently do not have any reminders. To set one up, you can click on
                            an item in your daily store or add one here
                        </p>
                    </div>
                    <DefaultButton
                        onClick={() => navigate('/store/reminders/add')}
                        className={'mt-5'}>
                        <p className={'text-black text-sm'}>Add Reminder</p>
                    </DefaultButton>
                </div>
            </Container>
        </div>
    );
};

const ReminderOptions = ({ reminderId }: { reminderId: string }) => {
    return (
        <Popover className='relative'>
            <Popover.Button className={'focus:outline-none'}>
                <img
                    className={'h-6 focus:outline-none'}
                    src='/resources/icons/ellipsis-vertical.svg'
                    alt=''
                />
            </Popover.Button>
            <Popover.Panel className='absolute z-10 -left-10'>
                <div className='grid gap-2 p-2 px-5 bg-black rounded-md border-white/30 border'>
                    <Link to={`${reminderId}/edit`}>Edit</Link>
                    <Form method={'post'} action={`${reminderId}/delete`}>
                        <button type={'submit'} className={'appearance-none'}>
                            <p className={'text-red-500'}>Delete</p>
                        </button>
                    </Form>
                </div>
            </Popover.Panel>
        </Popover>
    );
};

export const ErrorBoundary = () => {
    return <NoRemindersComponent />;
};

export default RemindersPage;
