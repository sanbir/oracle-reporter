import axios from "axios";
import {logger} from "./helpers/logger";
import {DepositManagerApiSession} from "./models/DepositManagerApiSession";

export async function getPubkeysForSessionFromApi(sessionId: string) : Promise<string[]> {
    logger.info('getPubkeysForSessionFromApi started')

    if (!process.env.SESSION_PUBKEYS_URL) {
        throw new Error("No SESSION_PUBKEYS_URL in ENV")
    }
    if (!process.env.SESSION_PUBKEYS_USERNAME) {
        throw new Error("No SESSION_PUBKEYS_USERNAME in ENV")
    }
    if (!process.env.SESSION_PUBKEYS_PASSWORD) {
        throw new Error("No SESSION_PUBKEYS_PASSWORD in ENV")
    }

    const result = await axios.get(
        process.env.SESSION_PUBKEYS_URL! + sessionId, {
            auth: {
                username: process.env.SESSION_PUBKEYS_USERNAME,
                password: process.env.SESSION_PUBKEYS_PASSWORD
            }
        })

    const array = (result.data as {
        pubkey: string
    }[]).map(d => d.pubkey)

    logger.info(array.length + ' pubkeys fetched for ' + sessionId)

    logger.info('getPubkeysForSessionFromApi finished')
    return array
}
