import type {ActionFunction} from "@remix-run/node";
import { json} from "@remix-run/node";
import {commitClientSession, getClientSession} from "~/utils/session/session.server";
import {RiotAuthenticationClient} from "~/utils/auth/RiotAuthenticationClient";
import {requireLoginData} from "~/utils/auth/authrequest.server";

export const action: ActionFunction = async ({request, params}) => {
    const {username, password} = await requireLoginData(request)
    try {
        const user = await new RiotAuthenticationClient().authorize(username, password)
        const session = await getClientSession(request);
        session.set("user", user)
        return json({user: user}, {
            headers: {
                "Set-Cookie": await commitClientSession(session)
            }
        })
    } catch (e) {
        throw json({
            error: "Authentication failed. Maybe wrong credentials?"
        }, {
            status: 403
        })
    }
};
