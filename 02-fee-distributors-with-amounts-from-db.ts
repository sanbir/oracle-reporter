import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getFeeDistributorsWithAmountsFromDb} from "./scripts/getFeeDistributorsWithAmountsFromDb";

async function main() {
    logger.info('02-fee-distributors-with-amounts-from-db started')

    await getFeeDistributorsWithAmountsFromDb()

    logger.info('02-fee-distributors-with-amounts-from-db finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

