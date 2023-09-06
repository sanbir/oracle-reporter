import "dotenv/config"
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";

async function main() {
    logger.info('01-amounts-for-pubkeys started')
    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/amounts-for-pubkeys' + new Date().toISOString() + '.json'
    logger.info('Saving report to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(validatorWithFeeDistributorsAndAmounts))
    logger.info('Report saved')

    logger.info('01-amounts-for-pubkeys finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

