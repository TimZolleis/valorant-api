import type {ReauthenticationCookies} from "~/models/cookies/ReauthenticationCookies";
import type {PlayerRegion} from "~/models/user/Region";
import type {RSOUserInfo} from "~/models/user/authentication/RSOUserInfo";


export class ValorantUser {
    accessToken: string;
    entitlement: string;
    reauthenticationCookies: ReauthenticationCookies;
    userData: UserData
    constructor(accessToken: string, entitlement: string, reauthenticationCookies: ReauthenticationCookies, userInfo: RSOUserInfo) {
        this.accessToken = accessToken;
        this.entitlement = entitlement;
        this.reauthenticationCookies = reauthenticationCookies;
        this.userData = new UserData(userInfo);
    }
}
class UserData {
    puuid: string;
    gameName: string;
    tagLine: string;
    region: PlayerRegion
    constructor(userInfo: RSOUserInfo) {
        this.puuid = userInfo.sub;
        this.gameName = userInfo.acct.game_name;
        this.tagLine = userInfo.acct.tag_line;
        this.region = userInfo.affinity.pp;
    }
}

