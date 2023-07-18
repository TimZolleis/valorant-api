import type { RouteMatch } from '@remix-run/react';
import { Await, useLoaderData } from '@remix-run/react';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';
import type { DataFunctionArgs } from '@vercel/remix';
import { defer, redirect } from '@vercel/remix';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getItembyItemId, getOfferById } from '~/utils/store/storeoffer.server';
import { Suspense } from 'react';
import { WeaponComponent } from '~/ui/weapon/WeaponComponent';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';

export const handle = {
    breadcrumb: (match: RouteMatch) => <BreadCrumbLink to={match.pathname}>Offer</BreadCrumbLink>,
};
export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const offerId = requireParam('offerId', params);
    const offer = await getOfferById(user, offerId);
    if (!offer) throw redirect('/store/offers');
    const items = Promise.all(
        offer.Rewards.map((reward) => getItembyItemId(reward.ItemID, reward.ItemTypeID))
    );
    const prismaOffers = prisma.offers
        .findMany({
            where: {
                offerId,
                AND: {
                    puuid: user.userData.puuid,
                },
            },
            orderBy: {
                date: 'desc',
            },
        })
        .catch();
    return defer({ offer, items, prismaOffers });
};

const OfferIdPage = () => {
    const { offer, items, prismaOffers } = useLoaderData<typeof loader>();
    return (
        <>
            <div className={'py-2 w-full border-b border-white/20'}>
                <p className={' font-medium  text-headline-medium '}>Offer details</p>
                <Suspense>
                    <Await resolve={prismaOffers}>
                        {(prismaOffers) => (
                            <Detail
                                title={'LAST SEEN'}
                                value={
                                    prismaOffers[1]?.date
                                        ? DateTime.fromSeconds(prismaOffers[1].date)
                                              .setLocale('de-DE')
                                              .toLocaleString()
                                        : prismaOffers[0]?.date
                                        ? DateTime.fromSeconds(prismaOffers[0].date)
                                              .setLocale('de-DE')
                                              .toLocaleString()
                                        : 'NEVER'
                                }
                            />
                        )}
                    </Await>
                </Suspense>
            </div>
            <main className={'flex flex-col w-full'}>
                <div className={'mt-5'}>
                    <p className={' text-title-medium'}>Rewards</p>
                    <div className={'flex mt-2'}>
                        <Suspense>
                            <Await resolve={items}>
                                {(items) =>
                                    items.map((item) => (
                                        <WeaponComponent
                                            key={item.uuid}
                                            weapon={item}
                                            cost={offer.Cost}></WeaponComponent>
                                    ))
                                }
                            </Await>
                        </Suspense>
                    </div>
                </div>
            </main>
        </>
    );
};

const Detail = ({ title, value }: { title: string; value: string }) => {
    return (
        <div className={'flex gap-1'}>
            <p className={'text-zinc-500 text-label-medium  font-medium'}>{title}:</p>
            <p className={'font-medium   text-label-medium'}>{value}</p>
        </div>
    );
};

export default OfferIdPage;
