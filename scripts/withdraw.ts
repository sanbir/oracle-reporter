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
    const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

    const rewardData = fds.map(fd => {
        return [fd.feeDistributor, fd.amount.toString()]
    })

    const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)

    const filePath = getDatedJsonFilePath('merkle-tree')
    logger.info('Saving merkle tree to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(tree.dump()))
    logger.info('Merkle tree saved')

    await makeOracleReport(tree.root)
    logger.info('Root reported to the contract: ' + tree.root)

    const feeDistributorsAddresses = fds.map(fd => fd.feeDistributor)

    const balancesBefore = await getAllBalances(feeDistributorsAddresses)
    const balancesBeforePath = getDatedJsonFilePath('balances-before')
    logger.info('Saving balances before to ' + balancesBeforePath)
    fs.writeFileSync(balancesBeforePath, JSON.stringify(balancesBefore))
    logger.info('Balances before saved')

    await withdrawAll(feeDistributorsAddresses, tree)

    const balancesAfter = await getAllBalances(feeDistributorsAddresses)
    const balancesAfterPath = getDatedJsonFilePath('balances-after')
    logger.info('Saving balances after to ' + balancesAfterPath)
    fs.writeFileSync(balancesAfterPath, JSON.stringify(balancesAfter))
    logger.info('Balances after saved')

    const balancesDiff = await getBalancesDiff(balancesBefore, balancesAfter)
    const balancesDiffPath = getDatedJsonFilePath('balances-diff')
    logger.info('Saving balances diff to ' + balancesDiffPath)
    fs.writeFileSync(balancesDiffPath, JSON.stringify(balancesDiff))
    logger.info('Balances diff saved')
}
