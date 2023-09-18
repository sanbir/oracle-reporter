import { StandardMerkleTree } from "@openzeppelin/merkle-tree"
import {getDatedJsonFilePath} from "./getDatedJsonFilePath";
import {logger} from "./logger";
import fs from "fs";

export function buildMerkleTreeForFeeDistributorAddress(oracleData: string[][]) {
    const tree = StandardMerkleTree.of(oracleData, ["address", "uint256"]);

    const filePath = getDatedJsonFilePath('merkle-tree')
    logger.info('Saving merkle tree to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(tree.dump()))
    logger.info('Merkle tree saved')

    return tree
}
