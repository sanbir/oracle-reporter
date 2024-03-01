import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getHasRecentlyWithdrawn} from "./scripts/getHasRecentlyWithdrawn";

async function main() {
    logger.info('97-test started')

    const has = await getHasRecentlyWithdrawn('0xdb0dbcA30fDeBe4c4E475dd75eA61A911c72aF6d')
    console.log(has)

    const hasNot = await getHasRecentlyWithdrawn('0x746c5862900dE5C02bDE866B05FADC2923b41f88')
    console.log(hasNot)

    logger.info('97-test finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

