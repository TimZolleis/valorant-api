export interface ValorantApiPlayerLoadout {
    Subject: string;
    Version: number;
    Guns: Gun[];
    Sprays: Spray[];
    Identity: Identity;
    Incognito: boolean;
}

export interface Gun {
    ID: string;
    SkinID: string;
    SkinLevelID: string;
    ChromaID: string;
    Attachments: any[];
    CharmInstanceID?: string;
    CharmID?: string;
    CharmLevelID?: string;
}

export interface Spray {
    EquipSlotID: string;
    SprayID: string;
    SprayLevelID: any;
}

export interface Identity {
    PlayerCardID: string;
    PlayerTitleID: string;
    AccountLevel: number;
    PreferredLevelBorderID: string;
    HideAccountLevel: boolean;
}
