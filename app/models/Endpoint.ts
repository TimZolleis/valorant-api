import {PlayerRegion} from "~/models/user/Region";

export const ENDPOINTS = {
    AUTH: 'https://auth.riotgames.com',
    REAUTH: 'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1',
    ENTITLEMENTS: 'https://entitlements.auth.riotgames.com',
    BASE: (region: PlayerRegion) => `https://pd.${region}.a.pvp.net`,
    SHARED: (region: PlayerRegion) => `https://shared.${region}.a.pvp.net`,
    PARTY: (region: PlayerRegion) => `https://glz-${region}-1.${region}.a.pvp.net`,
};

export class Endpoint {
    private region: PlayerRegion;
    private endpoint: string;
    private endpointType: keyof typeof ENDPOINTS;

    constructor(region: PlayerRegion, endpointType?: keyof typeof ENDPOINTS) {
        this.region = region;
        switch (endpointType) {
            case 'BASE': {
                this.base();
                return this;
            }
            case 'SHARED': {
                this.shared();
                return this;
            }
            case 'PARTY': {
                this.party();
                return this;
            }
        }
    }

    base() {
        this.endpointType = 'BASE';
        this.endpoint = ENDPOINTS.BASE(this.region);
        return this;
    }

    shared() {
        this.endpointType = 'SHARED';
        this.endpoint = ENDPOINTS.SHARED(this.region);
        return this;
    }

    party() {
        this.endpointType = 'PARTY';
        this.endpoint = ENDPOINTS.PARTY(this.region);
        return this;
    }

    setRegion(region: PlayerRegion) {
        this.region = region;
    }

    getEndpointType() {
        return this.endpointType;
    }

    getEndpoint() {
        return this.endpoint;
    }
}