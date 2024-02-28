import {getValidatorWithFeeDistributorsAndAmount} from "./getValidatorWithFeeDistributorsAndAmount";
import {FeeDistributorWithAmountForPeriod} from "./models/FeeDistributorWithAmountForPeriod";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import {logger} from "./helpers/logger";
import fs from "fs";
import {ethers} from "ethers";
import {FeeDistributorWithAmount} from "./models/FeeDistributorWithAmount";
import {FeeDistributorIdentityParams} from "./models/FeeDistributorIdentityParams";

export async function getFeeDistributorsWithAmountsFromDb() {
    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    const feeDistributorsWithAmountsForPeriods = validatorWithFeeDistributorsAndAmounts.reduce((
        accumulator: FeeDistributorWithAmountForPeriod[],
        validator
    ) => {
        const existingEntry = accumulator.find(
            entry => entry.feeDistributor === validator.feeDistributor
                && entry.startDate.getTime() === validator.startDate.getTime()
                && entry.endDate.getTime() === validator.endDate.getTime()
        )

        if (existingEntry) {
            existingEntry.amount += validator.amount;
        } else {
            const newEntry: FeeDistributorWithAmountForPeriod = {
                feeDistributor: validator.feeDistributor,
                amount: validator.amount,
                identityParams: validator.identityParams,

                newClientBasisPoints: validator.newClientBasisPoints || validator.identityParams?.clientConfig.basisPoints!,
                fdBalance: validator.fdBalance,

                startDate: validator.startDate,
                endDate: validator.endDate
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    const feeDistributorsWithAmountsFromDb = squashPeriods(feeDistributorsWithAmountsForPeriods)

    feeDistributorsWithAmountsFromDb.forEach(fd => {
        if (fd.newClientBasisPoints !== fd.identityParams?.clientConfig.basisPoints!) {
            logger.info(fd.feeDistributor + ' has newClientBasisPoints = ' + fd.newClientBasisPoints)
            logger.info('Old fd.amount = ' + fd.amount)

            const amountInWei = ethers.BigNumber.from(fd.amount).mul(1e9)

            const updatedAmountInWei = (
                ((fd.fdBalance.add(amountInWei)).mul(10000 - fd.newClientBasisPoints!))
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

function squashPeriods(feeDistributors: FeeDistributorWithAmountForPeriod[]): FeeDistributorWithAmount[] {
    const totals: { [feeDistributor: string]: {
        totalWeightedBasisPoints: number,
            totalSeconds: number,
            fdBalance: ethers.BigNumber,
            amount: number
            identityParams: FeeDistributorIdentityParams | null
    } } = {};

    feeDistributors.forEach(distributor => {
        const durationInSeconds = (distributor.endDate.getTime() - distributor.startDate.getTime()) / 1000;
        const weightedBasisPoints = distributor.newClientBasisPoints * durationInSeconds;

        if (!totals[distributor.feeDistributor]) {
            totals[distributor.feeDistributor] = {
                totalWeightedBasisPoints: 0,
                totalSeconds: 0,
                fdBalance: distributor.fdBalance,
                amount: 0,
                identityParams: distributor.identityParams
            };
        }

        totals[distributor.feeDistributor].totalWeightedBasisPoints += weightedBasisPoints;
        totals[distributor.feeDistributor].totalSeconds += durationInSeconds;
        totals[distributor.feeDistributor].amount += distributor.amount;
    });

    return Object.entries(totals).map(([feeDistributor, {
        totalWeightedBasisPoints,
        totalSeconds,
        fdBalance,
        amount,
        identityParams
    }]) => ({
        feeDistributor,
        newClientBasisPoints: Math.floor(totalWeightedBasisPoints / totalSeconds),
        fdBalance,
        amount,
        identityParams
    }));
}
