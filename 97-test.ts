import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {reTryWithdrawWithExistingTree} from "./scripts/reTryWithdrawWithExistingTree";
import {getRowsFromBigQuery} from "./scripts/getRowsFromBigQuery";

async function main() {
    logger.info('97-test started')

    const indexesWithAmounts = await getRowsFromBigQuery(
        [1217607],
        new Date('2024-02-01'),
        new Date('2024-03-01')
    )


    logger.info('97-test finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

