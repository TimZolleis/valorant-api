import { AuthType } from '~/models/valorant/auth/ValorantAuthenticationTokenResponse';

export interface Multifactor {
    email: string;
    method: string;
    methods: string[];
    multiFactorCodeLength: number;
    mfaVersion: string;
}

export interface ValorantAuthenticationMultifactorResponse {
    type: AuthType;
    multifactor: Multifactor;
    country: string;
    securityProfile: string;
}
