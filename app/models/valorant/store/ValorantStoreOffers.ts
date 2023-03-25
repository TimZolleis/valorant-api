export interface Cost {
    [key: string]: number;
}

export interface Reward {
    ItemTypeID: string;
    ItemID: string;
    Quantity: number;
}

export interface Offer {
    OfferID: string;
    IsDirectPurchase: boolean;
    StartDate: string;
    Cost: Cost;
    Rewards: Reward[];
}

export interface UpgradeCurrencyOffer {
    OfferID: string;
    StorefrontItemID: string;
    Offer: Offer;
}

export interface ValorantStoreOffers {
    Offers: Offer[];
    UpgradeCurrencyOffers: UpgradeCurrencyOffer[];
}
