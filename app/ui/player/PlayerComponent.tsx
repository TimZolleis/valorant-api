import { Container } from '~/ui/container/Container';
import type { PlayerRank } from '~/utils/player/rank.server';
import type { ValorantApiCharacter } from '~/models/valorant-api/ValorantApiCharacter';
import type { ValorantNameService } from '~/models/valorant/player/ValorantNameService';
import type { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';

export const PlayerComponent = ({
    rank,
    character,
    nameservice,
    competitiveUpdate,
    matchId,
}: {
    rank: PlayerRank;
    character: ValorantApiCharacter | null;
    nameservice: ValorantNameService;
    competitiveUpdate?: ValorantCompetitiveUpdate;
    matchId: string;
}) => {
    const competitiveMatch = competitiveUpdate?.Matches.find((match) => match.MatchID === matchId);
    const hasWon = competitiveMatch?.RankedRatingEarned
        ? competitiveMatch.RankedRatingEarned > 0
        : null;

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
                                <p className={'text-body-medium font-semibold capitalize'}>
                                    {rank?.tier?.tierName.toLowerCase()}
                                    <span className={'pl-2 text-gray-400 font-light'}>
                                        {rank?.latestRR}RR
                                    </span>
                                    <span
                                        className={`font-light pl-2 ${
                                            hasWon ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        <span>{hasWon ? '+' : ''}</span>
                                        <span>{competitiveMatch?.RankedRatingEarned}RR</span>
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
