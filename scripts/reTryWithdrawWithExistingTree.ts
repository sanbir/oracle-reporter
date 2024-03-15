import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import fs from "fs";
import {withdrawAll} from "./withdrawAll";
import {getAllBalances} from "./getAllBalances";
import {getBalancesDiff} from "./getBalancesDiff";
import {logger} from "./helpers/logger";

export async function reTryWithdrawWithExistingTree() {
    logger.info('reTryWithdrawWithExistingTree started')

    const merkleTreeFilePath = './reports/merkle-tree2024-03-15T13:34:48.754Z.json'

    // @ts-ignore
    const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync(merkleTreeFilePath)));

    // @ts-ignore
    const feeDistributorsAddresses: string[] = tree.values.map(v => v.value[0])

    logger.info(feeDistributorsAddresses.length + ' feeDistributorsAddresses found in the tree file')

    await withdrawAll(feeDistributorsAddresses, tree)

    logger.info('reTryWithdrawWithExistingTree finished')
}
