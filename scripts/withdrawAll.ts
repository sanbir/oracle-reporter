import { withdrawOneOracle } from "./withdrawOneOracle"
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

export async function withdrawAll(feeDistributorsAddresses: string[], tree: StandardMerkleTree<any[]>) {
    for (const feeDistributorsAddress of feeDistributorsAddresses) {
        await withdrawOneOracle(feeDistributorsAddress, tree)
    }
}
