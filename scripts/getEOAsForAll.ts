import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {logger} from "./helpers/logger";
import {getEOAs} from "./getEOAs";

export async function getEOAsForAll() {
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

    const eoas: string[] = []
    for (const fd of feeDistributorsWithAmountsFromDb) {
        try {
            const eoa = await getEOAs(fd.feeDistributor)

            eoas.push(eoa)
        } catch (error) {
            logger.error(error)
        }
    }

    logger.info(
        eoas.length
        + ' eoas were updated'
    )

    return eoas
}
