import { InterpolatedCoregamePlayer, InterpolatedPregamePlayer } from '~/routes/api/match/live';
import { useFetcherData } from '~/utils/hooks/fetcher';
import { Container } from '~/ui/container/Container';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { PlayerDetailsRoute } from '~/routes/api/player/$playerId/nameservice';
import { useNavigate } from 'react-router';

export const PlayerInGameComponent = ({
    player,
}: {
    player: InterpolatedPregamePlayer | InterpolatedCoregamePlayer;
}) => {
    const playerDetails = useFetcherData<PlayerDetailsRoute>(
        `/api/player/${player.PlayerIdentity.Subject}/nameservice`
    );

    const navigate = useNavigate();
    const navigateToPlayerDetails = (puuid: string) => {
        return navigate(`/${puuid}/details`);
    };

    if (playerDetails) {
        return (
            <Container>
                <div
                    className={'flex gap-2 items-center'}
                    onClick={() => navigateToPlayerDetails(player.Subject)}>
                    <div className={'p-1.5 rounded-md border border-gray-600/40'}>
                        <img className={'h-8'} src={player.character?.displayIconSmall} alt='' />
                    </div>
                    <div>
                        <p className={'font-inter font-semibold text-title-small'}>
                            {playerDetails.GameName}
                            <span className={'text-neutral-600'}>#{playerDetails.TagLine}</span>
                        </p>
                        <div className={'flex gap-2 items-center'}>
                            <img className={'h-6'} src={player.rank?.tier?.smallIcon} alt='' />
                            <p className={'font-inter text-body-medium font-semibold capitalize'}>
                                {player.rank?.tier?.tierName.toLowerCase()}
                                <span className={' pl-2 text-gray-400 font-light'}>
                                    {player.rank?.latestRR}RR
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }
    return <LoadingContainer />;
};
