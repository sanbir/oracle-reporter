import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getFeeDistributorFactoryContract} from "./helpers/getFeeDistributorFactoryContract";

export async function predictFeeDistributorAddress(input: FeeDistributorInput) {
    const factory = getFeeDistributorFactoryContract()

    const feeDistributorAddress: string = await factory.predictFeeDistributorAddress(
        input.referenceFeeDistributor,
        input.clientConfig,
        input.referrerConfig
    )

    return feeDistributorAddress
}
