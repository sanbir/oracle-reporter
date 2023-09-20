import {ethers} from "ethers";
import {logger} from "./logger";

export async function getTransactionStatus(txHash: string) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

        const receipt = await provider.getTransactionReceipt(txHash)

        if (!receipt) {
            return 'Not confirmed yet'
        }

        // Check the status field
        if (receipt.status === 1) {
            return 'Succeeded'
        } else if (receipt.status === 0) {
            return 'Failed'
        } else {
            return 'Unknown status' // Ideally, it should be either 0 or 1
        }
    } catch (error) {
        logger.error(error)
        return 'Fetching error'
    }
}

