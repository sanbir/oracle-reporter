import { ethers } from "ethers"
import { getFeeDistributorFactoryContract_3_1 } from "./helpers/getFeeDistributorFactoryContract_3_1"

export async function predictDeoracleizedFeeDistributor(clientAddress: string) {
    const factory = getFeeDistributorFactoryContract_3_1()
    const referenceFd = process.env.REFERENCE_FEE_DISTRIBUTOR_3_1_DEORACLEIZED

    const clientConfig = {
        recipient: clientAddress,
        basisPoints: 0
    }

    const referrerConfig = {
        recipient: ethers.constants.AddressZero,
        basisPoints: 0
    }

    const feeDistributorAddress: string = await factory.predictFeeDistributorAddress(
      referenceFd,
      clientConfig,
      referrerConfig
    )

    return feeDistributorAddress
}
