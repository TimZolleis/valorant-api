import { Container } from '~/ui/container/Container';
import { Player } from '~/models/valorant/match/ValorantMatchDetails';
import { useFetcherData } from '~/utils/hooks/fetcher';
import { PlayerRankRoute } from '~/routes/api/player/$playerId/competitive/rank';
import { CharacterRoute } from '~/routes/api/character/$characterId';
import type { PlayerRank } from '~/utils/player/rank.server';
import type { ValorantApiCharacter } from '~/models/valorant-api/ValorantApiCharacter';
import type { ValorantNameService } from '~/models/valorant/player/ValorantNameService';

export const PlayerComponent = ({
    rank,
    character,
    nameservice,
}: {
    rank: PlayerRank;
    character: ValorantApiCharacter | null;
    nameservice: ValorantNameService;
}) => {
    return (
        <>
            <Container>
                <div className={'flex gap-2 items-center'}>
                    <div className={'p-1.5 rounded-md border border-gray-600/40'}>
                        <img className={'h-8'} src={character?.displayIconSmall} alt='' />
                    </div>
                    <div>
                        <p className={' font-semibold text-title-small'}>
                            {nameservice.GameName}
                            <span className={'text-neutral-600'}>#{nameservice.TagLine}</span>
                        </p>
                        <div className={'flex gap-2 items-center'}>
                            <>
                                <img className={'h-6'} src={rank?.tier?.smallIcon} alt='' />
                                <p className={' text-body-medium font-semibold capitalize'}>
                                    {rank?.tier?.tierName.toLowerCase()}
                                    <span className={' pl-2 text-gray-400 font-light'}>
                                        {rank?.latestRR}RR
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
