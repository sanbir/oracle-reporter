import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import fs from "fs";
import {withdrawAll} from "./withdrawAll";
import {getAllBalances} from "./getAllBalances";
import {getBalancesDiff} from "./getBalancesDiff";
import {logger} from "./helpers/logger";

export async function reTryWithdrawWithExistingTree() {
    logger.info('reTryWithdrawWithExistingTree started')

    const merkleTreeFilePath = getDatedJsonFilePath('merkle-tree')

    // @ts-ignore
    const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync(merkleTreeFilePath)));

    // @ts-ignore
    const feeDistributorsAddresses: string[] = tree.values.map(v => v.value[0])

    logger.info(feeDistributorsAddresses.length + ' feeDistributorsAddresses found in the tree file')

    await withdrawAll(feeDistributorsAddresses, tree)

    const balancesAfter = await getAllBalances(feeDistributorsAddresses, 'balances-after')

    const balancesBeforeFilePath = getDatedJsonFilePath('balances-before')
    // @ts-ignore
    const balancesBefore = JSON.parse(fs.readFileSync(balancesBeforeFilePath))

    const balancesDiff = await getBalancesDiff(balancesBefore, balancesAfter)
    const balancesDiffPath = getDatedJsonFilePath('balances-diff')
    logger.info('Saving balances diff to ' + balancesDiffPath)
    fs.writeFileSync(balancesDiffPath, JSON.stringify(balancesDiff))
    logger.info('Balances diff saved')

    logger.info('reTryWithdrawWithExistingTree finished')
}
