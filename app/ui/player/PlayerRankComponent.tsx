import { PlayerRankRoute } from '~/routes/api/player/$playerId/competitive/rank';
import { SmallContainer } from '~/ui/container/SmallContainer';

export const PlayerRankComponent = ({ data }: { data: PlayerRankRoute }) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>Current Rank</p>
            <div className={'flex items-center  py-2'}>
                <img className={'h-8'} src={data.rank.tier?.smallIcon} alt='' />
                <div className={'flex flex-col p-2'}>
                    <p className={'font-semibold text-title-small first-letter:capitalize'}>
                        {data.rank.tier?.tierName.toLowerCase()}
                    </p>
                    <p className={'text-label-small text-neutral-400'}>{data.rank.latestRR}RR</p>
                </div>
            </div>
        </SmallContainer>
    );
};
