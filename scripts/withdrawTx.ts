import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {obtainProof} from "./helpers/obtainProof";
import {logger} from "./helpers/logger";
import {getFeeDistributorContractSigned} from "./helpers/getFeeDistributorContract";
import {ContractTransaction} from "ethers";
import {getNonce, incrementNonce} from "./helpers/nonce";

export async function withdrawTx(feeDistributorAddress: string, tree: StandardMerkleTree<any[]>) {
    logger.info('withdrawTx started for: ' + feeDistributorAddress)

    const {proof, value} = obtainProof(feeDistributorAddress, tree)
    const amountInGwei: number = value[1]

    if (!process.env.MAX_FEE_PER_GAS) {
        throw new Error('No MAX_FEE_PER_GAS in ENV')
    }
    if (!process.env.MAX_PIORITY_FEE_PER_GAS) {
        throw new Error('No MAX_PIORITY_FEE_PER_GAS in ENV')
    }

    const feeDistributor = getFeeDistributorContractSigned(feeDistributorAddress)

    const tx: ContractTransaction = await feeDistributor.withdraw(proof, amountInGwei, {
        gasLimit: 200000,
        maxFeePerGas: process.env.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: process.env.MAX_PIORITY_FEE_PER_GAS,
        nonce: getNonce()
    })

    incrementNonce()

    logger.info('withdrawTx finished for: ' + feeDistributorAddress + '. Hash: ' + tx.hash)

    return tx.hash
}
