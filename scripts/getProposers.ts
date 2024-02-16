import axios from "axios";
import {logger} from "./helpers/logger";
import {PROPOSERS} from "./helpers/PROPOSERS";

export async function getProposers() {
    logger.info('getProposers started')

    if (!process.env.FEE_MANAGER_PROPOSERS_URL) {
        throw new Error("No FEE_MANAGER_PROPOSERS_URL in ENV")
    }

    // const result = await axios.get(process.env.FEE_MANAGER_PROPOSERS_URL!)
    //
    // const array = result.data.proposer_config as Record<string, {fee_recipient: string}>

    logger.info('getProposers finished')
    return PROPOSERS.proposer_config // array
}
