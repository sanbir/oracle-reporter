import "dotenv/config"
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {getDatedJsonFilePath} from "./scripts/helpers/getDatedJsonFilePath";

async function main() {
    logger.info('01-amounts-for-pubkeys started')
    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    const filePath = getDatedJsonFilePath('amounts-for-pubkeys')
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

