import axios from "axios";
import {logger} from "./helpers/logger";
import {DepositManagerApiDistributor} from "./models/DepositManagerApiDistributor";

export async function getDistributorsFromApi() : Promise<DepositManagerApiDistributor[]> {
    logger.info('getDistributorsFromApi started')

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
        "session_id": string
    }[]

    logger.info('getDistributorsFromApi finished')
    return array
}
