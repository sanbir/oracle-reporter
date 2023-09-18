import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import {logger} from "./helpers/logger";
import fs from "fs";

export async function getFeeDistributorsWithAmountsFromDb() {
    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    const feeDistributorsWithAmountsFromDb = validatorWithFeeDistributorsAndAmounts.reduce((
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

    const filePath = getDatedJsonFilePath('fee-distributors-with-amounts-from-db')
    logger.info('Saving fee-distributors-with-amounts-from-db to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithAmountsFromDb))
    logger.info('fee-distributors-with-amounts-from-db saved')
}
