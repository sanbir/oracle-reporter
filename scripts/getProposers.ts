import axios from "axios";
import {logger} from "./helpers/logger";

export async function getProposers() {
    logger.info('getProposers started')
    const result = await axios.get(process.env.FEE_MANAGER_PROPOSERS_URL!)

    const array = result.data.proposer_config as Record<string, {fee_recipient: string}>

    logger.info('getProposers finished')
    return array
}
