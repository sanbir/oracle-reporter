import axios from "axios";
import {logger} from "./helpers/logger";
import {DepositManagerApiSession} from "./models/DepositManagerApiSession";

export async function getSessionsFromApi() : Promise<DepositManagerApiSession[]> {
    logger.info('getSessionsFromApi started')

    if (!process.env.DISTRIBUTORS_URL) {
        throw new Error("No DISTRIBUTORS_URL in ENV")
    }

    const result = await axios.get(process.env.DISTRIBUTORS_URL!)

    const array = result.data as {
        "activated_at": string,
        "address": string,
        "client_basis_points": number,
        "client_fee_recipient": string,
        "id": number,
        "referrer_fee_recipient": string,
        "session_id": string,
        pubkeys: Set<string>
    }[]

    logger.info('getSessionsFromApi finished')
    return array
}
