import { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { Container } from '~/ui/container/Container';

export const WeaponComponent = ({
    weapon,
    cost,
}: {
    weapon: ValorantApiWeaponSkin;
    cost: number;
}) => {
    return (
        <Container>
            <div className={'h-full flex flex-col items-start justify-between'}>
                <img className={'max-h-20'} src={weapon.displayIcon} alt='' />
                <div className={'flex gap-2 items-center mt-5 relative'}>
                    <p className={'font-inter font-semibold text-title-small'}>
                        {weapon.displayName}
                    </p>
                    <div
                        className={
                            'rounded-full bg-white px-3 font-semibold text-label-medium text-black'
                        }>
                        {cost}
                    </div>
                </div>
            </div>
        </Container>
    );
};
