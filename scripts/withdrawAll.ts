import { withdrawErc4337 } from "./withdrawErc4337"
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {logger} from "./helpers/logger";
import {withdrawTx} from "./withdrawTx";
import {getUse4337} from "./helpers/getUse4337";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {getIsContract} from "./helpers/getIsContract";
import {deployFeeDistributor} from "./deployFeeDistributor";

export async function withdrawAll(feeDistributors: FeeDistributorWithAmount[], tree: StandardMerkleTree<any[]>) {
    logger.info('withdrawAll started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error('MIN_BALANCE_TO_WITHDRAW_IN_GWEI not set in ENV')
    }

    const txHashesForFdAddresses: {address: string, hash: string}[] = []

    for (const fd of feeDistributors) {
        try {
            const isDeployed = getIsContract(fd.feeDistributor)

            if (!isDeployed) {
                if (!fd.identityParams) {
                    throw new Error('No identityParams for ' + fd.feeDistributor)
                }
                const deployHash = await deployFeeDistributor(fd.identityParams)
                txHashesForFdAddresses.push({address: fd.feeDistributor, hash: deployHash})
            }

            let withdrawHash = ''
            const use4337 = getUse4337()
            if (use4337) {
                withdrawHash = await withdrawErc4337(fd.feeDistributor, tree)
            } else {
                withdrawHash = await withdrawTx(fd.feeDistributor, tree)
            }
            txHashesForFdAddresses.push({address: fd.feeDistributor, hash: withdrawHash})

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
