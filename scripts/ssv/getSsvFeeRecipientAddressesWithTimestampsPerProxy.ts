import {logger} from "../helpers/logger";
import {ethers} from "ethers";
import {getSsvNetworkContract} from "../helpers/getSsvNetworkContract";

export async function getSsvFeeRecipientAddressesWithTimestampsPerProxy(proxyAddress: string) { // same for 3.1
    logger.info('getSsvFeeRecipientAddressesWithTimestampsPerProxy started for ' + proxyAddress)

    const ssvNetwork = getSsvNetworkContract()

    const logs = await ssvNetwork.queryFilter(ssvNetwork.filters.FeeRecipientAddressUpdated(proxyAddress))

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    const results = await Promise.all(logs.map(async (log) => {
        try {
            const block = await provider.getBlock(log.blockNumber);
            return {
                recipientAddress: log.args?.recipientAddress,
                timestamp: new Date(block.timestamp * 1000) // Convert Unix timestamp to JavaScript Date
            };
        } catch (error) {
            logger.error(error)
            return {
                recipientAddress: ethers.constants.AddressZero,
                timestamp: new Date()
            };
        }
    }));

    logger.info('getSsvFeeRecipientAddressesWithTimestampsPerProxy finished for ' + proxyAddress)

    return results
}
