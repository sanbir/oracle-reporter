import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {reTryWithdrawWithExistingTree} from "./scripts/reTryWithdrawWithExistingTree";

async function main() {
    logger.info('98-re-try-withdraw started')

    await reTryWithdrawWithExistingTree()

    logger.info('98-re-try-withdraw finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

