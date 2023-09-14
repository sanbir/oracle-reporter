import "dotenv/config"
import {buildMerkleTreeForFeeDistributorAddress} from "./scripts/helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {makeOracleReport} from "./scripts/makeOracleReport";
import {withdrawAll} from "./scripts/withdrawAll";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";
import {getAllBalances} from "./scripts/getAllBalances";
import {getBalancesDiff} from "./scripts/getBalancesDiff";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

async function main() {
    logger.info('07-withdraw started')

    // const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()
    //
    // const rewardData = fds.map(fd => {
    //     return [fd.feeDistributor, fd.amount.toString()]
    // })
    //
    // const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)
    //
    // const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/merkle-tree' + new Date().toISOString() + '.json'
    // logger.info('Saving merkle tree to ' + filePath)
    // fs.writeFileSync(filePath, JSON.stringify(tree.dump()))
    // logger.info('Merkle tree saved')
    //
    // await makeOracleReport(tree.root)
    // logger.info('Root reported to the contract: ' + tree.root)
    //
    // const feeDistributorsAddresses = fds.map(fd => fd.feeDistributor)
    //
    // const balancesBefore = await getAllBalances(feeDistributorsAddresses)
    // const balancesBeforePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/balances-before' + new Date().toISOString() + '.json'
    // logger.info('Saving balances before to ' + balancesBeforePath)
    // fs.writeFileSync(balancesBeforePath, JSON.stringify(balancesBefore))
    // logger.info('Balances before saved')


    // @ts-ignore
    const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync(process.env.FOLDER_FOR_REPORTS_PATH! + "/merkle-tree2023-09-14T01:16:21.414Z.json")));

    await makeOracleReport(tree.root)

    // @ts-ignore
    const feeDistributorsAddresses: any = tree.values.map(v => v.value[0])

    await withdrawAll(feeDistributorsAddresses, tree)

    const balancesAfter = await getAllBalances(feeDistributorsAddresses)
    const balancesAfterPath = process.env.FOLDER_FOR_REPORTS_PATH! + '/balances-after' + new Date().toISOString() + '.json'
    logger.info('Saving balances after to ' + balancesAfterPath)
    fs.writeFileSync(balancesAfterPath, JSON.stringify(balancesAfter))
    logger.info('Balances after saved')

    // const balancesDiff = await getBalancesDiff(balancesBefore, balancesAfter)
    // const balancesDiffPath = process.env.FOLDER_FOR_REPORTS_PATH! + '/balances-diff' + new Date().toISOString() + '.json'
    // logger.info('Saving balances diff to ' + balancesDiffPath)
    // fs.writeFileSync(balancesDiffPath, JSON.stringify(balancesDiff))
    // logger.info('Balances diff saved')

    logger.info('07-withdraw finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

