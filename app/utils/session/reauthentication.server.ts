import { UserData, ValorantUser } from '~/models/user/ValorantUser';
import { prisma } from '~/utils/db/db.server';
import { ReauthenticationCookies } from '~/models/cookies/ReauthenticationCookies';
import { RiotReauthenticationClient } from '~/utils/auth/RiotReauthenticationClient';
import type { User } from '@prisma/client';

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

export async function getReauthenticatedUser(user: User) {
    const reauthenticationCookies = await prisma.reauthenticationCookies.findUnique({
        where: {
            puuid: user.puuid,
        },
    });
    if (!reauthenticationCookies)
        throw new Error('The user does not have any reauthentication service!');
    const reauthenticationCookieModel = new ReauthenticationCookies(
        reauthenticationCookies.sub,
        reauthenticationCookies.ssid,
        reauthenticationCookies.clid,
        reauthenticationCookies.csid
    );

    const valorantUser = new ValorantUser(
        '',
        '',
        reauthenticationCookieModel,
        new UserData().fromDatabase(user)
    );
    return await new RiotReauthenticationClient()
        .init(valorantUser)
        .then((client) => client.reauthenticate());
}
