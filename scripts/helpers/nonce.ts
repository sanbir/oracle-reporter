import {ethers} from "ethers";
import {logger} from "./logger";

let nonce = 0

export async function setInitialNonce() {
    logger.info('setInitialNonce started')

    if (!process.env.RPC_URL) {
        throw new Error("No RPC_URL in ENV")
    }
    if (!process.env.PRIVATE_KEY) {
        throw new Error("No PRIVATE_KEY in ENV")
    }

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    // @ts-ignore
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    nonce = await provider.getTransactionCount(wallet.address)

    logger.info('nonce = ' + nonce)

    logger.info('setInitialNonce finished')
}

export function incrementNonce() {
    nonce++
}

export function getNonce() {
    return nonce
}
