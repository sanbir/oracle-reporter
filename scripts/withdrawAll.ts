import { withdrawErc4337 } from "./withdrawErc4337"
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {logger} from "./helpers/logger";
import {withdrawTx} from "./withdrawTx";
import {getUse4337} from "./helpers/getUse4337";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getHasRecentlyWithdrawn} from "./getHasRecentlyWithdrawn";

export async function withdrawAll(feeDistributorsAddresses: string[], tree: StandardMerkleTree<any[]>) {
    logger.info('withdrawAll started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error('MIN_BALANCE_TO_WITHDRAW_IN_GWEI not set in ENV')
    }

    const txHashesForFdAddresses: {address: string, hash: string}[] = []

    for (const feeDistributorsAddress of feeDistributorsAddresses) {
        try {
            const balance = await getBalance(feeDistributorsAddress)
            logger.info(
                'Balance of '
                + feeDistributorsAddress
                + ' is '
                + ethers.utils.formatUnits(balance, "ether")
                + 'ETH'
            )

            if (balance.lt(ethers.utils.parseUnits(process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI, "gwei"))) {
                logger.info(
                    'Balance of '
                    + feeDistributorsAddress
                    + ' is less than minimum to withdraw. Will not withdraw.'
                )
                continue
            }

            const hasRecentlyWithdrawn = await getHasRecentlyWithdrawn(feeDistributorsAddress)
            if (hasRecentlyWithdrawn) {
                logger.info(
                    + feeDistributorsAddress
                    + ' has recently withdrawn. Will not withdraw.'
                )
                continue
            }

            let hash = ''
            const use4337 = getUse4337()
            if (use4337) {
                hash = await withdrawErc4337(feeDistributorsAddress, tree)
            } else {
                hash = await withdrawTx(feeDistributorsAddress, tree)
            }
            txHashesForFdAddresses.push({address: feeDistributorsAddress, hash})

        } catch (error) {
            logger.error(error)
        }
    }

    const filePath = getDatedJsonFilePath('tx-hashes-for-fd-addresses')
    logger.info('Saving tx-hashes-for-fd-addresses to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(txHashesForFdAddresses))
    logger.info('tx-hashes-for-fd-addresses saved')

    logger.info('withdrawAll finished')

    return txHashesForFdAddresses
}
