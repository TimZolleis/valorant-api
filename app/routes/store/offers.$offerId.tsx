import { Await, RouteMatch, useLoaderData } from '@remix-run/react';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';
import { DataFunctionArgs, defer } from '@remix-run/node';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getItembyItemId, getOfferById } from '~/utils/store/storeoffer.server';
import { Suspense } from 'react';
import { WeaponComponent } from '~/ui/weapon/WeaponComponent';

export const handle = {
    breadcrumb: (match: RouteMatch) => <BreadCrumbLink to={match.pathname}>Offer</BreadCrumbLink>,
};

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const offerId = requireParam('offerId', params);
    const offer = await getOfferById(user, offerId);
    const items = Promise.all(offer!.Rewards.map((reward) => getItembyItemId(reward.ItemID)));

    return defer({ offer, items });
};

const OfferIdPage = () => {
    const { offer, items } = useLoaderData<typeof loader>();

    return (
        <>
            <div className={'py-2'}>
                <p className={'font-inter font-semibold text-white text-title-large'}>
                    Offer details
                </p>
                <p className={'font-medium text-label-medium text-gray-400'}>{offer.OfferID}</p>
            </div>
            <div className={'flex mt-5'}>
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
        </>
    );
};

export default OfferIdPage;
