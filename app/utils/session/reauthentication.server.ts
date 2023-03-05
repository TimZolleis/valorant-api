import type { ValorantUser } from '~/models/user/ValorantUser';
import { prisma } from '~/utils/db/db.server';

export async function updateReauthenticationCookies(user: ValorantUser) {
    return await prisma.reauthenticationCookies.upsert({
        where: {
            puuid: user.userData.puuid,
        },
        create: {
            puuid: user.userData.puuid,
            sub: user.reauthenticationCookies.sub,
            ssid: user.reauthenticationCookies.ssid,
            clid: user.reauthenticationCookies.clid,
            csid: user.reauthenticationCookies.csid,
        },
        update: {
            sub: user.reauthenticationCookies.sub,
            ssid: user.reauthenticationCookies.ssid,
            clid: user.reauthenticationCookies.clid,
            csid: user.reauthenticationCookies.csid,
        },
    });
}

export async function updateUser(user: ValorantUser) {
    const databaseUser = await prisma.user.findUnique({
        where: {
            puuid: user.userData.puuid,
        },
    });
    if (!databaseUser) {
        await prisma.user.create({
            data: {
                puuid: user.userData.puuid,
                tagLine: user.userData.tagLine,
                gameName: user.userData.gameName,
                region: user.userData.region,
            },
        });
    }
    return await updateReauthenticationCookies(user);
}
