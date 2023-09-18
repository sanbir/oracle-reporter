import { withdrawErc4337 } from "./withdrawErc4337"
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {logger} from "./helpers/logger";
import {withdrawTx} from "./withdrawTx";
import {getUse4337} from "./helpers/getUse4337";

export async function withdrawAll(feeDistributorsAddresses: string[], tree: StandardMerkleTree<any[]>) {
    logger.info('withdrawAll started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error('MIN_BALANCE_TO_WITHDRAW_IN_GWEI not set in ENV')
    }

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

            const use4337 = getUse4337()
            if (use4337) {
                await withdrawErc4337(feeDistributorsAddress, tree)
            } else {
                await withdrawTx(feeDistributorsAddress, tree)
            }
        } catch (error) {
            logger.error(error)
        }
    }

    logger.info('withdrawAll finished')
}
