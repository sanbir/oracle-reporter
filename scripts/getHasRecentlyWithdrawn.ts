import {logger} from "./helpers/logger";
import {ethers} from "ethers";

export async function getHasRecentlyWithdrawn(fdAddress: string) {
    logger.info('getRecentlyWithdrawn started for ' + fdAddress)

    if (!process.env.RPC_URL) {
        throw new Error("No RPC_URL in ENV")
    }

    const eventSignature = ethers.utils.id("FeeDistributor__Withdrawn(uint256,uint256,uint256)");

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    const filter = {
        address: fdAddress,
        fromBlock: 19440408,
        toBlock: 'latest',
        topics: [ eventSignature ]
    };

    const logs = await provider.getLogs(filter)

    if (!logs.length) {
        logger.info('No FeeDistributor__Withdrawn logs found for ' + fdAddress)
        logger.info('getRecentlyWithdrawn finished for ' + fdAddress)
        return false
    } else {
        logger.info('getRecentlyWithdrawn finished for ' + fdAddress)

        return true
    }
}
