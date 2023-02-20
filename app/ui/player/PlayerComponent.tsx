import { Container } from '~/ui/container/Container';
import { Player } from '~/models/valorant/match/ValorantMatchDetails';
import { useFetcherData } from '~/utils/hooks/fetcher';
import { PlayerRankRoute } from '~/routes/api/player/$playerId/competitive/rank';
import { CharacterRoute } from '~/routes/api/character/$characterId';

export const PlayerComponent = ({ player }: { player: Player }) => {
    const rankData = useFetcherData<PlayerRankRoute>(
        `/api/player/${player.subject}/competitive/rank`
    );
    const characterData = useFetcherData<CharacterRoute>(`/api/character/${player.characterId}`);
    return (
        <>
            <Container>
                <div className={'flex gap-2 items-center'}>
                    <div className={'p-1.5 rounded-md border border-gray-600/40'}>
                        <img className={'h-8'} src={characterData?.displayIconSmall} alt='' />
                    </div>
                    <div>
                        <p className={'font-inter font-semibold text-title-small'}>
                            {player.gameName}
                            <span className={'text-neutral-600'}>#{player.tagLine}</span>
                        </p>
                        <div className={'flex gap-2 items-center'}>
                            <>
                                <img
                                    className={'h-6'}
                                    src={rankData?.rank?.tier?.smallIcon}
                                    alt=''
                                />
                                <p
                                    className={
                                        'font-inter text-body-medium font-semibold capitalize'
                                    }>
                                    {rankData?.rank?.tier?.tierName.toLowerCase()}
                                    <span className={' pl-2 text-gray-400 font-light'}>
                                        {rankData?.rank?.latestRR}RR
                                    </span>
                                </p>
                            </>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
};
