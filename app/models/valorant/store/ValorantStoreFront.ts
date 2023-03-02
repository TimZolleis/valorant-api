export interface Item {
    ItemTypeID: string;
    ItemID: string;
    Amount: number;
}

export interface FeaturedItem {
    Item: Item;
    BasePrice: number;
    CurrencyID: string;
    DiscountPercent: number;
    DiscountedPrice: number;
    IsPromoItem: boolean;
}

export interface Bundle {
    ID: string;
    DataAssetID: string;
    CurrencyID: string;
    Items: FeaturedItem[];
    ItemOffers?: any;
    TotalBaseCost?: any;
    TotalDiscountedCost?: any;
    TotalDiscountPercent: number;
    DurationRemainingInSeconds: number;
    WholesaleOnly: boolean;
}

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

export interface ItemOffer {
    BundleItemOfferID: string;
    Offer: Offer;
    DiscountPercent: number;
    DiscountedCost: Cost;
}

export interface FeaturedBundle {
    Bundle: Bundle;
    Bundles: Bundle[];
    BundleRemainingDurationInSeconds: number;
}

export interface SingleItemStoreOffer {
    OfferID: string;
    IsDirectPurchase: boolean;
    StartDate: string;
    Cost: Cost;
    Rewards: Reward[];
}

export interface SkinsPanelLayout {
    SingleItemOffers: string[];
    SingleItemStoreOffers: SingleItemStoreOffer[];
    SingleItemOffersRemainingDurationInSeconds: number;
}

export interface UpgradeCurrencyOffer {
    OfferID: string;
    StorefrontItemID: string;
    Offer: Offer;
}

export interface UpgradeCurrencyStore {
    UpgradeCurrencyOffers: UpgradeCurrencyOffer[];
}

export interface DiscountCosts {
    [key: string]: number;
}

export interface BonusStoreOffer {
    BonusOfferID: string;
    Offer: Offer;
    DiscountPercent: number;
    DiscountCosts: DiscountCosts;
    IsSeen: boolean;
}

export interface BonusStore {
    BonusStoreOffers: BonusStoreOffer[];
    BonusStoreRemainingDurationInSeconds: number;
}

export interface ValorantStoreFront {
    FeaturedBundle: FeaturedBundle;
    SkinsPanelLayout: SkinsPanelLayout;
    UpgradeCurrencyStore: UpgradeCurrencyStore;
    BonusStore: BonusStore;
}
