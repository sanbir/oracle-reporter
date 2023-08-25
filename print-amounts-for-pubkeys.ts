import "dotenv/config"
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {logger} from "./scripts/helpers/logger";

async function main() {
    logger.info('print-amounts-for-pubkeys started')
    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    logger.info('Results:')
    validatorWithFeeDistributorsAndAmounts.forEach(console.log)

    logger.info('print-amounts-for-pubkeys finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

