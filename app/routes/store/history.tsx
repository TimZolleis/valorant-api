import type { DataFunctionArgs } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { prisma } from '~/utils/db/db.server';
import { useLoaderData } from '@remix-run/react';
import type { Offers } from '@prisma/client';
import { getItembyItemId } from '~/utils/store/storeoffer.server';
import type { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { Container } from '~/ui/container/Container';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { of } from 'rxjs';

type OfferWithItem = {
    offer: Offers;
    item: ValorantApiWeaponSkin | undefined;
};

type LoaderData = {
    offerWithItems: OfferWithItem[];
};
export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const offers = await prisma.offers.findMany({
        where: {
            puuid: user.userData.puuid,
        },
    });
    const offerWithItems = await Promise.all(
        offers.map(async (offer) => {
            try {
                const item = await getItembyItemId(offer.offerId, offer.itemTypeId);
                return {
                    offer,
                    item,
                };
            } catch (e) {
                return {
                    offer,
                    item: undefined,
                };
            }
        })
    );
    return { offerWithItems };
};

type SortedOffer = {
    [key: string]: OfferWithItem[];
};

const StoreHistoryPage = () => {
    const { offerWithItems } = useLoaderData() as unknown as LoaderData;
    const dates = [
        ...new Set(
            offerWithItems.map((o) =>
                DateTime.fromSeconds(o.offer.date).setLocale('de-De').toLocaleString()
            )
        ),
    ];
    const sortedOffers = dates.map((date) => {
        const daily = offerWithItems
            .filter((offer) => {
                return (
                    DateTime.fromSeconds(offer.offer.date).setLocale('de-De').toLocaleString() ===
                    date
                );
            })
            .filter((offer) => offer.offer.type === 'DAILY');

        const featured = offerWithItems
            .filter((offer) => {
                return (
                    DateTime.fromSeconds(offer.offer.date).setLocale('de-De').toLocaleString() ===
                    date
                );
            })
            .filter((offer) => offer.offer.type === 'FEATURED');
        return { date, daily, featured };
    });

    if (offerWithItems.length === 0) {
        return <NoStoreHistoryAvailable />;
    }
    return (
        <main>
            <p className={' text-title-large font-medium py-2'}>Store history </p>
            <div>
                {sortedOffers.map((offer) => (
                    <DailyStoreComponent
                        key={offer.date}
                        featuredOffers={offer.featured}
                        dailyOffers={offer.daily}
                        date={offer.date}></DailyStoreComponent>
                ))}
            </div>
        </main>
    );
};

const DailyStoreComponent = ({
    featuredOffers,
    dailyOffers,
    date,
}: {
    featuredOffers: OfferWithItem[];
    dailyOffers: OfferWithItem[];
    date: string;
}) => {
    const [showItems, setShowItems] = useState(false);
    return (
        <div className={'border-b border-white/20 w-full py-2'}>
            <div className={'flex gap-2 items-center'} onClick={() => setShowItems(!showItems)}>
                <p className={' text-headline-small'}>{date}</p>
                <motion.img
                    className={`${
                        showItems ? 'rotate-180' : 'rotate-0'
                    } transition ease-in-out duration-300 h-4`}
                    src='/resources/icons/chevron-down.svg'
                    alt=''
                />
            </div>
            <AnimatePresence>
                {showItems && (
                    <motion.div
                        className={'space-y-2'}
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: 'auto',
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}>
                        <p className={' text-title-small'}>Daily</p>
                        {dailyOffers.map((offerWithItem) => (
                            <Container className={'bg-black'} key={offerWithItem.offer.offerId}>
                                <div className={'flex p-2 items-center'}>
                                    <div className={'flex-[0_0_15%] mr-5'}>
                                        <img
                                            className={'max-h-10'}
                                            src={offerWithItem.item?.displayIcon}
                                            alt=''
                                        />
                                    </div>
                                    <div className={'flex justify-between w-full items-center'}>
                                        <div>
                                            <p className={' font-medium text-sm  mt-3'}>
                                                {offerWithItem.item?.displayName}
                                            </p>
                                            <span className={'flex text-neutral-600 text-xs'}>
                                                <p>{offerWithItem.offer.type}</p>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Container>
                        ))}

                        <p className={' text-title-small'}>Featured</p>
                        {featuredOffers.map((offerWithItem) => (
                            <Container className={'bg-black'} key={offerWithItem.offer.offerId}>
                                <div className={'flex p-2 items-center'}>
                                    <div className={'flex-[0_0_15%] mr-5'}>
                                        <img
                                            className={'max-h-10'}
                                            src={offerWithItem.item?.displayIcon}
                                            alt=''
                                        />
                                    </div>
                                    <div className={'flex justify-between w-full items-center'}>
                                        <div>
                                            <p className={' font-medium text-sm  mt-3'}>
                                                {offerWithItem.item?.displayName}
                                            </p>
                                            <span className={'flex text-neutral-600 text-xs'}>
                                                <p>{offerWithItem.offer.type}</p>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Container>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NoStoreHistoryAvailable = () => {
    return (
        <Container>
            <div className={'text-center'}>
                <p className={' text-title-medium font-medium'}>No store history available</p>
                <p className={'text-neutral-500 text-sm'}>
                    It seems like you just recently started using this app. We track your store
                    everyday when rotation changes.{' '}
                </p>
            </div>
        </Container>
    );
};

export default StoreHistoryPage;
