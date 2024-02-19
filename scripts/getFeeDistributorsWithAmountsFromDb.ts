import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import {logger} from "./helpers/logger";
import fs from "fs";
import {ethers} from "ethers";

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
                amount: validator.amount,
                identityParams: validator.identityParams
            }

            if (validator.newClientBasisPoints) {
                const amountInWei = ethers.BigNumber.from(newEntry.amount).mul(1e9)

                const updatedAmountInWei = (
                    ((validator.fdBalance.add(amountInWei)).mul(10000 - validator.newClientBasisPoints))
                        .div(10000 - validator.identityParams?.clientConfig.basisPoints!)
                ).sub(validator.fdBalance)

                // New CL = ((EL + oldCL) * (10000 - new client Bp)) / (10000 - old client Bp) - EL

                const updatedAmountInGWei = updatedAmountInWei.div(1e9)
                newEntry.amount = updatedAmountInGWei.toNumber()
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    const filePath = getDatedJsonFilePath('fee-distributors-with-amounts-from-db')
    logger.info('Saving fee-distributors-with-amounts-from-db to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithAmountsFromDb))
    logger.info('fee-distributors-with-amounts-from-db saved')

    return feeDistributorsWithAmountsFromDb
}
