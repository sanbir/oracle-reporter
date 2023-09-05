import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {getLegacyAlreadySplitClRewards} from "./getLegacyAlreadySplitClRewards";
import {logger} from "./helpers/logger";

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
                amount: validator.amount
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    logger.info(feeDistributorsWithAmountsFromDb.length + ' feeDistributorsWithAmountsFromDb found')

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

    return feeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
}
