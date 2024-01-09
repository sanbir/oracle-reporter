import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getFeeDistributorFactoryContract} from "./helpers/getFeeDistributorFactoryContract";

export async function predictFeeDistributorAddress(input: FeeDistributorInput) {
    const factory = getFeeDistributorFactoryContract()

    if (!input.identityParams) {
        throw new Error('No identityParams')
    }

    const feeDistributorAddress: string = await factory.predictFeeDistributorAddress(
        input.identityParams.referenceFeeDistributor,
        input.identityParams.clientConfig,
        input.identityParams.referrerConfig
    )

    return feeDistributorAddress
}
