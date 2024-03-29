import "dotenv/config"
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {logger} from "./scripts/helpers/logger";

async function main() {
    logger.info('01-amounts-for-pubkeys started')
    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()
    logger.info('01-amounts-for-pubkeys finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

