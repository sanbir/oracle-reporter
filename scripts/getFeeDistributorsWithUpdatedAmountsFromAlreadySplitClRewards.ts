import {getAlreadySplitClRewards} from "./getAlreadySplitClRewards";
import {logger} from "./helpers/logger";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getFeeDistributorsWithAmountsFromDb} from "./getFeeDistributorsWithAmountsFromDb";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";

export async function getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards() {
    const feeDistributorsWithAmountsFromDb = await getFeeDistributorsWithAmountsFromDb()

    logger.info(feeDistributorsWithAmountsFromDb.length + ' feeDistributorsWithAmountsFromDb found')

    const feeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards: FeeDistributorWithAmount[] = []
    for (const fd of feeDistributorsWithAmountsFromDb) {
        try {
            const alreadySplitClRewards = await getAlreadySplitClRewards(fd.feeDistributor)

            logger.info(fd.feeDistributor + ' amount before alreadySplitClRewards = ' + fd.amount)
            logger.info(fd.feeDistributor + ' alreadySplitClRewards = ' + alreadySplitClRewards)

            const updatedAmount = fd.amount + alreadySplitClRewards

            logger.info(fd.feeDistributor + ' amount after alreadySplitClRewards = ' + updatedAmount)

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
