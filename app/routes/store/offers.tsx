import type { DataFunctionArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import {
    getDailyOffers,
    getFeaturedOffers,
    getNightMarket,
    getStoreFront,
} from '~/utils/store/storeoffer.server';
import type { RouteMatch } from '@remix-run/react';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { WeaponComponent } from '~/ui/weapon/WeaponComponent';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const storefront = await getStoreFront(user);
    const dailyOffers = getDailyOffers(storefront);
    const featuredOffers = getFeaturedOffers(storefront);
    const nightmarketOffers = getNightMarket(storefront);

    return defer({ dailyOffers, featuredOffers, nightmarketOffers });
};

export const handle = {
    breadcrumb: (match: RouteMatch) => <BreadCrumbLink to={match.pathname}>Offers</BreadCrumbLink>,
};

const StoreOfferPage = () => {
    const { dailyOffers, featuredOffers, nightmarketOffers } = useLoaderData<typeof loader>();

    return (
        <div className={''}>
            <section>
                <div className={'flex gap-2'}>
                    <p className={' text-title-large font-medium py-2'}>Daily offers </p>
                </div>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={dailyOffers}>
                        {(dailyOffers) => (
                            <div
                                className={
                                    'grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                }>
                                {dailyOffers.map((offer) => (
                                    <div className={'grid grid-cols-1'} key={offer.OfferID}>
                                        {offer.Rewards.map((reward) => (
                                            <WeaponComponent
                                                key={reward.uuid}
                                                cost={offer.Cost}
                                                weapon={reward}></WeaponComponent>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Await>
                </Suspense>
            </section>
            <div className={'w-full h-5 border-b border-white/20'}></div>

            <section>
                <p className={' text-title-large font-medium py-2'}>Featured offers</p>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={featuredOffers}>
                        {(featuredOffers) => (
                            <div
                                className={
                                    'grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                                }>
                                {featuredOffers.map((offer) => (
                                    <WeaponComponent
                                        key={offer.Item.uuid}
                                        weapon={offer.Item}
                                        cost={offer.BasePrice}></WeaponComponent>
                                ))}
                            </div>
                        )}
                    </Await>
                </Suspense>
            </section>

            <div className={'w-full h-5 border-b border-white/20'}></div>

            {!!featuredOffers && (
                <section>
                    <Suspense fallback={<LoadingContainer />}>
                        <p className={' text-title-large font-medium py-2'}>Nightmarket offers</p>
                        <Await
                            resolve={nightmarketOffers}
                            errorElement={<div>No nightmarket available</div>}>
                            {(nightmarketOffers) => (
                                <div
                                    className={
                                        'grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                                    }>
                                    {nightmarketOffers.map((offer) =>
                                        offer.Offer.Rewards.map((reward) => (
                                            <WeaponComponent
                                                key={reward.uuid}
                                                weapon={reward}
                                                cost={offer.Offer.Cost}></WeaponComponent>
                                        ))
                                    )}
                                </div>
                            )}
                        </Await>
                    </Suspense>
                </section>
            )}
        </div>
    );
};

export default StoreOfferPage;
