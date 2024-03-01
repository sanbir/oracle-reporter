import {
    getFeeDistributorFactoryContractSigned
} from "./helpers/getFeeDistributorFactoryContract";
import {FeeDistributorIdentityParams} from "./models/FeeDistributorIdentityParams";
import {ContractTransaction} from "ethers";
import {getNonce, incrementNonce} from "./helpers/nonce";

export async function deployFeeDistributor(params: FeeDistributorIdentityParams) {
    const factory = getFeeDistributorFactoryContractSigned()

    const tx: ContractTransaction = await factory.createFeeDistributor(
        params.referenceFeeDistributor,
        params.clientConfig,
        params.referrerConfig, {
            gasLimit: 300000,
            maxFeePerGas: process.env.MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: process.env.MAX_PIORITY_FEE_PER_GAS,
            nonce: getNonce()
        }
    )

    incrementNonce()

    return tx.hash
}
