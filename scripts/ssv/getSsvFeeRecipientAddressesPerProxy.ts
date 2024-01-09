import {logger} from "../helpers/logger";
import {ethers} from "ethers";

export async function getSsvFeeRecipientAddressesPerProxy(proxyAddress: string) {
    logger.info('getSsvFeeRecipientAddressesPerProxy started')

    if (!process.env.RPC_URL) {
        throw new Error("No RPC_URL in ENV")
    }
    if (!process.env.SSV_NETWORK_ADDRESS) {
        throw new Error("No SSV_NETWORK_ADDRESS in ENV")
    }

    const eventSignature = ethers.utils.id("FeeRecipientAddressUpdated(address,address)");

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    const filter = {
        address: process.env.SSV_NETWORK_ADDRESS,
        fromBlock: 0,
        toBlock: 'latest',
        topics: [ eventSignature, proxyAddress ]
    };

    const logs = await provider.getLogs(filter)

    if (!logs.length) {
        logger.info('No FeeRecipientAddressUpdated logs found')
        logger.info('getSsvFeeRecipientAddressesPerProxy finished')
        return []
    } else {
        // Fetch block details for each log
        const results = await Promise.all(logs.map(async (log) => {
            const decodedLog = new ethers.utils.Interface([
                'event FeeRecipientAddressUpdated(address indexed owner, address recipientAddress)'
            ]).parseLog(log);

            const block = await provider.getBlock(log.blockNumber);
            return {
                recipientAddress: decodedLog.args.recipientAddress,
                timestamp: new Date(block.timestamp * 1000) // Convert Unix timestamp to JavaScript Date
            };
        }));

        logger.info('getSsvFeeRecipientAddressesPerProxy finished')

        return results
    }

}
