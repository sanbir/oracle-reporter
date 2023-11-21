import {
    getFeeDistributorFactoryContractSigned
} from "./helpers/getFeeDistributorFactoryContract";
import {FeeDistributorIdentityParams} from "./models/FeeDistributorIdentityParams";
import {ContractTransaction} from "ethers";

export async function deployFeeDistributor(params: FeeDistributorIdentityParams) {
    const factory = getFeeDistributorFactoryContractSigned()

    const tx: ContractTransaction = await factory.createFeeDistributor(
        params.referenceFeeDistributor,
        params.clientConfig,
        params.referrerConfig, {
            gasLimit: 300000,
            maxFeePerGas: process.env.MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: process.env.MAX_PIORITY_FEE_PER_GAS
        }
    )

    return tx.hash
}
