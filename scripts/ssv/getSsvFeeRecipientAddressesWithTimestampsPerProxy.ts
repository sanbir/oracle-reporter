import {logger} from "../helpers/logger";
import {ethers} from "ethers";
import {getSsvNetworkContract} from "../helpers/getSsvNetworkContract";
import { sleep } from "../helpers/sleep"

export async function getSsvFeeRecipientAddressesWithTimestampsPerProxy(proxyAddress: string) { // same for 3.1
    logger.info('getSsvFeeRecipientAddressesWithTimestampsPerProxy started for ' + proxyAddress)

    await sleep(1200)

    const ssvNetwork = getSsvNetworkContract()

    const logs = await ssvNetwork.queryFilter(ssvNetwork.filters.FeeRecipientAddressUpdated(proxyAddress), 19536041, "latest")

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    const results = await Promise.all(logs.map(async (log) => {
        await sleep(1200)
        const block = await provider.getBlock(log.blockNumber);
        return {
            recipientAddress: log.args?.recipientAddress,
            timestamp: new Date(block.timestamp * 1000) // Convert Unix timestamp to JavaScript Date
        };
    }));

    logger.info('getSsvFeeRecipientAddressesWithTimestampsPerProxy finished for ' + proxyAddress)

    return results
}
