import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getFeeDistributorsWithBalanceSsv} from "./scripts/getFeeDistributorsWithBalanceSsv";

async function main() {
    logger.info('99-get-fee-distributors-with-balance-ssv started')

    try {
        const fds = await getFeeDistributorsWithBalanceSsv()
    } catch (error) {
        logger.error(error)
    }
    logger.info('99-get-fee-distributors-with-balance-ssv finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

