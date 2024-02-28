import {ethers} from "ethers";
import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";
import {getIsContract} from "./helpers/getIsContract";
import {logger} from "./helpers/logger";

export async function getAlreadySplitClRewards(address: string) {
    logger.info('getAlreadySplitClRewards started for ' + address)

    const isContract = await getIsContract(address)
    if (!isContract) {
        return 0
    }

    const fd = getFeeDistributorContract(address)
    const alreadySplitClRewards = await fd.clientOnlyClRewards()

    logger.info('getAlreadySplitClRewards finished for ' + address)

    return (alreadySplitClRewards as ethers.BigNumber).div(1e9).toNumber()
}
