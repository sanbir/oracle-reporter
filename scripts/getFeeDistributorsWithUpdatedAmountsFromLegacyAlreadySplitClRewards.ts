import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {getAlreadySplitClRewards} from "./getAlreadySplitClRewards";
import {logger} from "./helpers/logger";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";

export async function getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards() {
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
                amount: validator.amount,
                identityParams: validator.identityParams
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    logger.info(feeDistributorsWithAmountsFromDb.length + ' feeDistributorsWithAmountsFromDb found')

    const feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards: FeeDistributorWithAmount[] = []
    for (const fd of feeDistributorsWithAmountsFromDb) {
        try {
            const alreadySplitClRewards = await getAlreadySplitClRewards(fd.feeDistributor)

            const updatedAmount = fd.amount + alreadySplitClRewards

            feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards.push({
                ...fd,
                amount: updatedAmount
            })
        } catch (error) {
            logger.error(error)
        }
    }

    const filePath = getDatedJsonFilePath('fee-distributors-with-legacy-already-split-amounts')
    logger.info('Saving fee-distributors-with-legacy-already-split-amounts to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards))
    logger.info('fee-distributors-with-legacy-already-split-amounts saved')

    logger.info(
        feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards.length
        + ' feeDistributors amount were updated'
    )

    return feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
}
