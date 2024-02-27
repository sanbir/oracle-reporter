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
                identityParams: validator.identityParams,

                newClientBasisPoints: validator.newClientBasisPoints,
                fdBalance: validator.fdBalance
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    feeDistributorsWithAmountsFromDb.forEach(fd => {
        if (fd.newClientBasisPoints) {
            logger.info(fd.feeDistributor + ' has newClientBasisPoints = ' + fd.newClientBasisPoints)
            logger.info('Old fd.amount = ' + fd.amount)

            const amountInWei = ethers.BigNumber.from(fd.amount).mul(1e9)

            const updatedAmountInWei = (
                ((fd.fdBalance.add(amountInWei)).mul(10000 - fd.newClientBasisPoints))
                    .div(10000 - fd.identityParams?.clientConfig.basisPoints!)
            ).sub(fd.fdBalance)

            // New CL = ((EL + oldCL) * (10000 - new client Bp)) / (10000 - old client Bp) - EL

            const updatedAmountInGWei = updatedAmountInWei.div(1e9)
            fd.amount = updatedAmountInGWei.toNumber()

            logger.info('New fd.amount = ' + fd.amount)
        }
    })

    const filePath = getDatedJsonFilePath('fee-distributors-with-amounts-from-db')
    logger.info('Saving fee-distributors-with-amounts-from-db to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithAmountsFromDb))
    logger.info('fee-distributors-with-amounts-from-db saved')

    return feeDistributorsWithAmountsFromDb
}
