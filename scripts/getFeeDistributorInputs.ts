import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getFdAddressesWithPeriodsFromApi} from "./getFdAddressesWithPeriodsFromApi";
import { ethers } from "ethers"
import { Period } from "./models/Period"

export async function getFeeDistributorInputs() {
    logger.info('getFeeDistributorInputs started')

    if (!process.env.REFERENCE_FEE_DISTRIBUTOR) {
        throw new Error("No REFERENCE_FEE_DISTRIBUTOR in ENV")
    }

    const fdAddressesWithPeriodsFromApi = await getFdAddressesWithPeriodsFromApi()
    const fsAddresses = Object.keys(fdAddressesWithPeriodsFromApi)
    logger.info(fsAddresses.length + ' fd addresses with periods from API')

    const now = new Date()
    const startDate = new Date(Number(process.env.DISTRIBUTORS_URL!.split('/').pop()))

    const feeDistributorInputs: FeeDistributorInput[] = fsAddresses.map(fdAddress => {
        const periodsFromApi = fdAddressesWithPeriodsFromApi[fdAddress]

        const first = periodsFromApi[0]

        const clientConfig = {
            recipient: first.client_fee_recipient,
            basisPoints: first.client_basis_points
        }

        const referrerConfig = {
            recipient: first.referrer_fee_recipient,
            basisPoints: first['referrer_basis_points'] as number || 0
        }

        const periods: Period[] = periodsFromApi.map(pa => ({
            startDate: new Date(pa.activated_at) < startDate
              ? startDate
              : new Date(pa.activated_at),

            endDate: pa.deactivated_at
              ? new Date(pa.deactivated_at)
              : now,

            pubkeys: pa.validators
        }))

        periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

        return {
            fdAddress: ethers.utils.getAddress(fdAddress),

            identityParams: {
                referenceFeeDistributor: process.env.REFERENCE_FEE_DISTRIBUTOR!,
                clientConfig,
                referrerConfig
            },

            periods
        }
    })

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}

