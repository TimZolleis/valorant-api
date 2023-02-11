import { Endpoint } from '~/models/Endpoint';
import { PlayerRegion } from '~/models/user/Region';

export class RiotRequest {
    private region: PlayerRegion;
    private endpoint: Endpoint;
    private url: string;

    constructor(region: PlayerRegion) {
        this.region = region;
    }

    buildMatchUrl(url: string) {
        this.endpoint = new Endpoint(this.region).party();
        this.url = url;
        return this;
    }

    buildBaseUrl(url: string) {
        this.endpoint = new Endpoint(this.region).base();
        this.url = url;
        return this;
    }

    buildSharedUrl(url: string) {
        this.endpoint = new Endpoint(this.region).shared();
        this.url = url;
        return this;
    }

    setRegion(region: PlayerRegion) {
        this.region = region;
        this.endpoint.setRegion(this.region);
        return this;
    }

    getFallback() {
        this.endpoint = new Endpoint('na', this.endpoint.getEndpointType());
        return this;
    }

    getUrl() {
        return `${this.endpoint.getEndpoint()}/${this.url}`;
    }

    getEndpoint() {
        return `/${this.url}`;
    }
}