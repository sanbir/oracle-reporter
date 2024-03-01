import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";
import {buildMerkleTreeForFeeDistributorAddress} from "./helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./helpers/logger";
import fs from "fs";
import {makeOracleReport} from "./makeOracleReport";
import {getAllBalances} from "./getAllBalances";
import {withdrawAll} from "./withdrawAll";
import {getBalancesDiff} from "./getBalancesDiff";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";

export async function withdraw() {
    try {
        const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

        const rewardData = fds.map(fd => {
            return [fd.feeDistributor, fd.amount.toString()]
        })

        const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)

        await makeOracleReport(tree.root)
        logger.info('Root reported to the contract: ' + tree.root)

        const feeDistributorsAddresses = fds.map(fd => fd.feeDistributor)

        //const balancesBefore = await getAllBalances(feeDistributorsAddresses, 'balances-before')
        await withdrawAll(feeDistributorsAddresses, tree)
        // const balancesAfter = await getAllBalances(feeDistributorsAddresses, 'balances-after')
        //
        // const balancesDiff = await getBalancesDiff(balancesBefore, balancesAfter)
        // const balancesDiffPath = getDatedJsonFilePath('balances-diff')
        // logger.info('Saving balances diff to ' + balancesDiffPath)
        // fs.writeFileSync(balancesDiffPath, JSON.stringify(balancesDiff))
        // logger.info('Balances diff saved')
    } catch (error) {
        logger.error(error)
    }
}
