import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getRowsFromBigQuery} from "./scripts/getRowsFromBigQuery";
import { getFeeDistributorInputs } from "./scripts/getFeeDistributorInputs"
import { getFdAddressesWithPeriodsFromApi } from "./scripts/getFdAddressesWithPeriodsFromApi"
import { getLastDistributionDate } from "./scripts/helpers/getLastDistributionDate"
import {
    getSsvFeeRecipientAddressesWithTimestampsPerProxy
} from "./scripts/ssv/getSsvFeeRecipientAddressesWithTimestampsPerProxy"

async function main() {
    logger.info('97-test started')

    // const fds = await test_getRowsFromBigQuery()

    const aa = await getSsvFeeRecipientAddressesWithTimestampsPerProxy('0xc2d42368d94E2D5d82F3b05a06Ec53eBFb81Ce0f')

    logger.info('97-test finished')
}

async function test_getRowsFromBigQuery() {
    const indexesWithAmounts = await getRowsFromBigQuery(
        [1217607],
        new Date('2024-02-01'),
        new Date('2024-03-01')
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

