import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {withdraw} from "./scripts/withdraw";

async function main() {
    logger.info('07-withdraw started')

    await withdraw()

    logger.info('07-withdraw finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

