import type { DataFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { Await, useLoaderData } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { useNavigate } from 'react-router';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { getItembyItemId } from '~/utils/store/storeoffer.server';
import { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { Reminder } from '.prisma/client';

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
    const reminderItems = Promise.all(
        userWithReminders.reminders.map(async (reminder) => {
            return {
                reminder,
                skin: await getItembyItemId(reminder.offerId),
            };
        })
    );

    return defer({ userWithReminders, reminderItems });
};

const RemindersPage = () => {
    const { reminderItems } = useLoaderData<typeof loader>();
    return (
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
    );
};

const ReminderCard = ({ skin, reminder }: { skin: ValorantApiWeaponSkin; reminder: Reminder }) => {
    return (
        <Container className={'bg-black'}>
            <div className={'flex p-2 items-center'}>
                <div className={'flex-[0_0_20%]'}>
                    <img className={'max-h-10'} src={skin.displayIcon} alt='' />
                </div>
                <div>
                    <p className={'font-inter font-medium text-sm text-white mt-3'}>
                        {reminder.name}
                    </p>
                    <span>
                        <p className={'text-neutral-600 text-xs'}>ADDED {reminder.createdAt}</p> |{' '}
                        {skin.displayName}
                    </span>
                </div>
            </div>
        </Container>
    );
};

const NoRemindersComponent = () => {
    const navigate = useNavigate();

    return (
        <div className={'flex justify-center w-full'}>
            <Container className={'mt-10 w-1/2 bg-black'}>
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

export default RemindersPage;
