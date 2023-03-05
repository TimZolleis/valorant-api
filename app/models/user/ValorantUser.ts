import type { ReauthenticationCookies } from '~/models/cookies/ReauthenticationCookies';
import type { PlayerRegion } from '~/models/user/Region';
import type { RSOUserInfo } from '~/models/user/authentication/RSOUserInfo';
import type { User } from '@prisma/client';

export class ValorantUser {
    accessToken: string;
    entitlement: string;
    reauthenticationCookies: ReauthenticationCookies;
    userData: UserData;

    constructor(
        accessToken: string,
        entitlement: string,
        reauthenticationCookies: ReauthenticationCookies,
        userInfo: RSOUserInfo | UserData
    ) {
        this.accessToken = accessToken;
        this.entitlement = entitlement;
        this.reauthenticationCookies = reauthenticationCookies;
        this.userData =
            userInfo instanceof UserData ? userInfo : new UserData().fromRSOUserInfo(userInfo);
    }
}

export class UserData {
    puuid: string;
    gameName: string;
    tagLine: string;
    region: PlayerRegion;

    constructor() {
        return this;
    }

    fromRSOUserInfo(userInfo: RSOUserInfo) {
        this.puuid = userInfo.sub;
        this.gameName = userInfo.acct.game_name;
        this.tagLine = userInfo.acct.tag_line;
        this.region = userInfo.affinity.pp;
        return this;
    }

    fromDatabase(user: User) {
        this.puuid = user.puuid;
        this.gameName = user.gameName;
        this.tagLine = user.tagLine;
        this.region = user.region as PlayerRegion;
        return this;
    }
}
