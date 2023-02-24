import type { DataFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getPlayerStatistics } from '~/utils/player/statistics.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { Modal, useModal } from '~/ui/common/Modal';
import { useNavigate } from 'react-router';
import { Suspense, useMemo } from 'react';
import { getPlayerNameService } from '~/utils/player/nameservice.server';
import type { RouteMatch } from '@remix-run/react';
import { Await, Link, useLoaderData } from '@remix-run/react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { PlayerDetailsComponent } from '~/ui/player/PlayerDetailsComponent';

export const handle = {
    breadcrumb: (match: RouteMatch) => <Link to={`${match.pathname}`}>Player Details</Link>,
};
export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const playerId = requireParam('playerId', params);
    const statistics = getPlayerStatistics(user, playerId);
    const rank = getPlayerRank(user, playerId);
    const nameservice = getPlayerNameService(user, playerId);
    return defer({
        user,
        statistics,
        rank,
        nameservice,
    });
};

const PlayerDetailsPage = () => {
    const { statistics, rank, nameservice } = useLoaderData<typeof loader>();
    const { showModal } = useModal(true);
    const navigate = useNavigate();
    const promises = useMemo(
        () => Promise.all([rank, statistics, nameservice]),
        [rank, statistics, nameservice]
    );
    const toggleModal = () => {
        navigate(-1);
    };

    return (
        <Modal toggleModal={toggleModal} showModal={showModal}>
            <Suspense fallback={<LoadingContainer />}>
                <Await resolve={promises}>
                    {([rank, statistics, nameservice]) => (
                        <PlayerDetailsComponent
                            nameservice={nameservice}
                            rank={rank}
                            statistics={statistics}></PlayerDetailsComponent>
                    )}
                </Await>
            </Suspense>
        </Modal>
    );
};

export default PlayerDetailsPage;
