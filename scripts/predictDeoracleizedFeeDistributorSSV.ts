import {
    getFeeDistributorFactoryContract_3_1_SSV
} from "./helpers/getFeeDistributorFactoryContract_3_1_SSV"
import { ethers } from "ethers"

export async function predictDeoracleizedFeeDistributorSSV(clientAddress: string) {
    const factory = getFeeDistributorFactoryContract_3_1_SSV()
    const referenceFd = process.env.REFERENCE_FEE_DISTRIBUTOR_3_1_DEORACLEIZED_SSV

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
