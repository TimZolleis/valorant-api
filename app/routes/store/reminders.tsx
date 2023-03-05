import type { DataFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { useLoaderData } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { useNavigate } from 'react-router';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const userWithReminders = prisma.user.findUnique({
        where: {
            puuid: user.userData.puuid,
        },
        include: {
            reminders: true,
        },
    });
    return defer({ userWithReminders });
};

const RemindersPage = () => {
    const { userWithReminders } = useLoaderData<typeof loader>();
    return <NoRemindersComponent />;
};

const NoRemindersComponent = () => {
    const navigate = useNavigate();

    return (
        <div className={'flex justify-center w-full'}>
            <Container className={'mt-10 w-1/2'}>
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
