import type { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { Container } from '~/ui/container/Container';
import { Link } from '@remix-run/react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export const WeaponComponent = ({
    weapon,
    cost,
}: {
    weapon: ValorantApiWeaponSkin;
    cost: number;
}) => {
    return (
        <Link className={'flex'} to={`/store/offers/${weapon.uuid}`}>
            <Container className={'w-full'}>
                <div className={'h-full w-full flex flex-col items-start justify-between'}>
                    <img className={'max-h-14'} src={weapon.displayIcon} alt='' />
                    <div className={'flex gap-2 items-center mt-5 relative'}>
                        <p className={' font-semibold text-title-small'}>{weapon.displayName}</p>
                        <div
                            className={
                                'rounded-full bg-white px-3 font-semibold text-label-medium text-black'
                            }>
                            {cost}
                        </div>
                    </div>
                </div>
            </Container>
        </Link>
    );
};

// <Link className={'flex'} to={`/store/offers/${weapon.uuid}`}>
//     <div className={'h-full w-full flex flex-col items-start justify-between'}>
//         <img className={'max-h-14'} src={weapon.displayIcon} alt='' />
//         <div className={'flex gap-2 items-center mt-5 relative'}>
//             <p className={' font-semibold text-title-small'}>{weapon.displayName}</p>
//             <div
//                 className={
//                     'rounded-full bg-white px-3 font-semibold text-label-medium text-black'
//                 }>
//                 {cost}
//             </div>
//         </div>
//     </div>
// </Link>
