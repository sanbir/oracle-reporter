import {logger} from "./helpers/logger";
import {getClientOnlyClRewardsForPubkeys} from "./getClientOnlyClRewardsForPubkeys";
import {getFeeDistributorContractSigned} from "./helpers/getFeeDistributorContract";
import {ethers} from "ethers";

export async function setClientOnlyClRewards(feeDividerAddress: string, pubkeys: string[]) {
    logger.info('setClientOnlyClRewards started for ' + feeDividerAddress + ' ' + pubkeys.length + ' pubkeys')

    const clientOnlyClRewardsInGwei = await getClientOnlyClRewardsForPubkeys(pubkeys)
    const clientOnlyClRewards = ethers.BigNumber.from(clientOnlyClRewardsInGwei).mul(1e9)

    const feeDistributor = getFeeDistributorContractSigned(feeDividerAddress)

    const clientOnlyClRewardsFromContract = await feeDistributor.clientOnlyClRewards()

    if (clientOnlyClRewardsFromContract.eq(0)) {
        logger.info('clientOnlyClRewardsFromContract == 0. Setting...')

        await feeDistributor.setClientOnlyClRewards(clientOnlyClRewards, {
            gasLimit: 100000,
            maxFeePerGas: process.env.MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: process.env.MAX_PIORITY_FEE_PER_GAS
        })
    } else {
        logger.info('clientOnlyClRewardsFromContract == ' + clientOnlyClRewardsFromContract.toString())
        logger.info('clientOnlyClRewardsFromContract != 0. Will not set.')
    }

    logger.info('setClientOnlyClRewards finished for ' + feeDividerAddress + ' ' + pubkeys.length + ' pubkeys')
}
