import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {getAlreadySplitClRewards} from "./getAlreadySplitClRewards";
import {logger} from "./helpers/logger";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getFeeDistributorsWithAmountsFromDb} from "./getFeeDistributorsWithAmountsFromDb";

export async function getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards() {
    const feeDistributorsWithAmountsFromDb = await getFeeDistributorsWithAmountsFromDb()

    logger.info(feeDistributorsWithAmountsFromDb.length + ' feeDistributorsWithAmountsFromDb found')

    const feeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards: FeeDistributorWithAmount[] = []
    for (const fd of feeDistributorsWithAmountsFromDb) {
        try {
            const alreadySplitClRewards = await getAlreadySplitClRewards(fd.feeDistributor)

            const updatedAmount = fd.amount + alreadySplitClRewards

            feeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards.push({
                ...fd,
                amount: updatedAmount
            })
        } catch (error) {
            logger.error(error)
        }
    }

    const filePath = getDatedJsonFilePath('fee-distributors-with-legacy-already-split-amounts')
    logger.info('Saving fee-distributors-with-legacy-already-split-amounts to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards))
    logger.info('fee-distributors-with-legacy-already-split-amounts saved')

    logger.info(
        feeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards.length
        + ' feeDistributors amount were updated'
    )

    return feeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards
}
