import { InterpolatedCoregamePlayer, InterpolatedPregamePlayer } from '~/routes/api/match/live';
import { useFetcherData } from '~/utils/hooks/fetcher';
import { Container } from '~/ui/container/Container';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { PlayerDetailsRoute } from '~/routes/api/player/$playerId/nameservice';
import { useNavigate } from 'react-router';
import { ValorantApiCharacter } from '~/models/valorant-api/ValorantApiCharacter';
import { PlayerRank } from '~/utils/player/rank.server';
import { ValorantNameService } from '~/models/valorant/player/ValorantNameService';
import { Link } from '@remix-run/react';
import { PregamePlayer } from '~/models/valorant/match/ValorantPregameMatch';
import { CoregamePlayer } from '~/models/valorant/match/ValorantCoregameMatch';

export const PlayerInGameComponent = ({
    player,
    character,
    rank,
    nameService,
}: {
    player: PregamePlayer | CoregamePlayer;
    character: ValorantApiCharacter | null;
    rank: PlayerRank;
    nameService: ValorantNameService;
}) => {
    return (
        <Container>
            <div className={'flex gap-2 items-center'}>
                <div className={'p-1.5 rounded-md border border-gray-600/40'}>
                    <img className={'h-8'} src={character?.displayIconSmall} alt='' />
                </div>
                <div>
                    <p className={'font-inter font-semibold text-title-small'}>
                        {nameService.GameName}
                        <span className={'text-neutral-600'}>#{nameService.TagLine}</span>
                    </p>
                    <div className={'flex gap-2 items-center'}>
                        <img className={'h-6'} src={rank?.tier?.smallIcon} alt='' />
                        <p className={'font-inter text-body-medium font-semibold capitalize'}>
                            {rank?.tier?.tierName.toLowerCase()}
                            <span className={' pl-2 text-gray-400 font-light'}>
                                {rank?.latestRR}RR
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    );
};
