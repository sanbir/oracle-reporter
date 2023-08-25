import "dotenv/config"
import {FeeDistributorWithAmount} from "./scripts/models/FeeDistributorWithAmount";
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";

async function main() {
    logger.info('02-fee-distributors-with-amounts started')

    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    const feeDistributorsWithAmounts = validatorWithFeeDistributorsAndAmounts.reduce((
        accumulator: FeeDistributorWithAmount[],
        validator
    ) => {
        const existingEntry = accumulator.find(
            entry => entry.feeDistributor === validator.feeDistributor
        )

        if (existingEntry) {
            existingEntry.amount += validator.amount;
        } else {
            const newEntry: FeeDistributorWithAmount = {
                feeDistributor: validator.feeDistributor,
                amount: validator.amount
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/fee-distributors-with-amounts' + new Date() + '.json'
    logger.info('Saving report to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithAmounts))
    logger.info('Report saved')

    logger.info('02-fee-distributors-with-amounts finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

