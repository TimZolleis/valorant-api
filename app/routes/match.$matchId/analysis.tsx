import { Form, useLoaderData } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { DefaultButton } from '~/ui/common/DefaultButton';
import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { analyzeMatch } from '~/utils/match/match.server';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const matchId = requireParam('matchId', params);
    const playerGameStats = await prisma.playerGameStats.findMany({
        where: {
            matchId,
        },
    });
    return json({ playerGameStats });
};

export const action = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const matchId = requireParam('matchId', params);
    await analyzeMatch(user, matchId);
    return null;
};

const MatchDetailsPage = () => {
    const { playerGameStats } = useLoaderData<typeof loader>();

    if (playerGameStats.length > 0) return <p>Showing data</p>;

    return (
        <div className={'text-white mt-5'}>
            <NoDetailsComponent></NoDetailsComponent>
        </div>
    );
};

const NoDetailsComponent = () => {
    return (
        <Container>
            <p className={'font-semibold text-center text-title-large'}>No Analytics to show</p>
            <p className={'text-center font-inter text-label-medium text-gray-400'}>
                This match has not yet been analysed.
            </p>
            <div className={'flex w-full items-center justify-center mt-3'}>
                <Form method={'post'}>
                    <DefaultButton>
                        <p className={'text-black'}>Run analysis</p>
                    </DefaultButton>
                </Form>
            </div>
        </Container>
    );
};

export default MatchDetailsPage;
