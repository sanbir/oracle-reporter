import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export function obtainProof(feeDistributorAddress: string, tree: StandardMerkleTree<any[]>) {
    for (const [i, value] of tree.entries()) {
        if (value[0] === feeDistributorAddress) {
            const proof = tree.getProof(i);
            return ({proof, value})
        }
    }

    throw new Error(`feeDistributorAddress=${feeDistributorAddress} not found in tree`)
}
