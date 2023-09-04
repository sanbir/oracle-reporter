import "dotenv/config"
import {FeeDistributorWithAmount} from "./scripts/models/FeeDistributorWithAmount";
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {getLegacyAlreadySplitClRewards} from "./scripts/getLegacyAlreadySplitClRewards";

async function main() {
    logger.info('03-fee-distributors-with-legacy-already-split-amounts started')

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

    const feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards: FeeDistributorWithAmount[] = []
    for (const fd of feeDistributorsWithAmountsFromDb) {
        try {
            const legacyAlreadySplitClRewards = await getLegacyAlreadySplitClRewards(fd.feeDistributor)

            const updatedAmount = fd.amount + legacyAlreadySplitClRewards

            feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards.push({
                feeDistributor: fd.feeDistributor,
                amount: updatedAmount
            })
        } catch (error) {
            logger.error(error)
        }
    }

    logger.info(
        feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards.length
        + ' feeDistributors amount were updated'
    )

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/fee-distributors-with-legacy-already-split-amounts' + new Date() + '.json'
    logger.info('Saving report to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards))
    logger.info('Report saved')

    logger.info('03-fee-distributors-with-legacy-already-split-amounts finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

