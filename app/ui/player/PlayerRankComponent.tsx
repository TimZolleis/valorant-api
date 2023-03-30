import { PlayerRankRoute } from '~/routes/api/player/$playerId/competitive/rank';
import { SmallContainer } from '~/ui/container/SmallContainer';
import type { PlayerRank } from '~/utils/player/rank.server';

export const PlayerRankComponent = ({ rank }: { rank: PlayerRank }) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium  border-b border-white/20'}>Current Rank</p>
            <div className={'flex items-center py-2'}>
                <img className={'h-10'} src={rank?.tier?.smallIcon} alt='' />
                <div className={'flex flex-col p-2'}>
                    <p className={'font-semibold  text-title-large capitalize'}>
                        {rank?.tier?.tierName.toLowerCase()}
                    </p>
                    <p className={'text-label-medium leading-none text-neutral-400'}>
                        {rank?.latestRR}RR
                    </p>
                </div>
            </div>
        </SmallContainer>
    );
};
