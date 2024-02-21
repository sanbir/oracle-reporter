import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {predictFeeDistributorAddress} from "./predictFeeDistributorAddress";
import {FeeDistributorToWithdraw} from "./models/FeeDistributorToWithdraw";
import {getSeconds} from "./helpers/getSeconds";

export async function getFeeDistributorsWithBalance(feeDistributorInputs: FeeDistributorInput[]) {
    logger.info('getFeeDistributorsWithBalance started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error("No MIN_BALANCE_TO_WITHDRAW_IN_GWEI in ENV")
    }

    const fdsWithoutBalance: {
        clientAddress: string,
        basisPoints: number,
        start: Date,
        end: Date
    }[] = []

    const feeDistributorsWithBalance: FeeDistributorToWithdraw[] = []

    for (const input of feeDistributorInputs) {
        try {
            const feeDistributorsAddress = input.fdAddress || await predictFeeDistributorAddress(input)

            const balance = await getBalance(feeDistributorsAddress)
            logger.info(
                'Balance of '
                + feeDistributorsAddress
                + ' is '
                + ethers.utils.formatUnits(balance, "ether")
                + 'ETH'
            )

            if (balance.lt(ethers.utils.parseUnits(process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI, "gwei"))) {
                logger.info(
                    'Balance of '
                    + feeDistributorsAddress
                    + ' is less than minimum to withdraw. Will not withdraw.'
                )

                if (input.identityParams) {
                    if (input.endDate > new Date("2024-01-31T20:20:00.000Z")) {
                        fdsWithoutBalance.push({
                            clientAddress: input.identityParams.clientConfig.recipient, basisPoints:
                            input.identityParams.clientConfig.basisPoints,
                            start: input.startDate,
                            end: input.endDate
                        })
                    }
                }

                continue
            }

            feeDistributorsWithBalance.push({
                address: feeDistributorsAddress,

                identityParams: input.identityParams,
                pubkeys: input.pubkeys,

                startDateIso: input.startDate,
                endDateIso: input.endDate,

                balance,
                newClientBasisPoints: null
            })
        } catch (error) {
            logger.error(error)
        }
    }

    if (fdsWithoutBalance.length) {
        logger.info(fdsWithoutBalance.length + ' fdsWithoutBalance')

        // @ts-ignore
        fdsWithoutBalance.sort((a, b) => a.start - b.start)

        for (const fdWithoutBalance of fdsWithoutBalance) {
            const fdsWithBalance = feeDistributorsWithBalance.filter(
                fd => fd.identityParams?.clientConfig.recipient === fdWithoutBalance.clientAddress
            )

            if (fdsWithBalance.length) {
                // @ts-ignore
                fdsWithBalance.sort((a, b) => a.startDateIso - b.startDateIso)

                const closestFdWithBalance = fdsWithBalance.find(
                    fdWithBalance => fdWithBalance.startDateIso > fdWithoutBalance.start
                )

                if (closestFdWithBalance && closestFdWithBalance.identityParams) {
                    const fdsWithoutBalanceInBetween = fdsWithoutBalance.filter(
                        fdWoBalance =>
                            fdWoBalance.start > fdWithoutBalance.start && fdWoBalance.start < closestFdWithBalance.startDateIso
                    )

                    const totalSeconds =
                        getSeconds(fdWithoutBalance.end) - getSeconds(fdWithoutBalance.start) +
                        getSeconds(closestFdWithBalance.endDateIso!) - getSeconds(closestFdWithBalance.startDateIso) +
                        fdsWithoutBalanceInBetween.reduce(
                            (_, f) => _ + getSeconds(f.end) - getSeconds(f.start),
                            0
                        )

                    const sumOfBasisPointsXseconds =
                        (getSeconds(fdWithoutBalance.end) - getSeconds(fdWithoutBalance.start))
                            * fdWithoutBalance.basisPoints +
                        (getSeconds(closestFdWithBalance.endDateIso!) - getSeconds(closestFdWithBalance.startDateIso))
                            * closestFdWithBalance.identityParams.clientConfig.basisPoints +
                        fdsWithoutBalanceInBetween.reduce(
                            (_, f) => _ + (getSeconds(f.end) - getSeconds(f.start)) * f.basisPoints,
                            0
                        )

                    const weightedAvgBasisPoints = Math.floor(sumOfBasisPointsXseconds / totalSeconds)

                    logger.info('weightedAvgBasisPoints for ' + closestFdWithBalance.address + ' is ' + weightedAvgBasisPoints)

                    closestFdWithBalance.startDateIso = fdWithoutBalance.start
                    closestFdWithBalance.newClientBasisPoints = weightedAvgBasisPoints
                }
            }
        }
    }

    logger.info('getFeeDistributorsWithBalance finished')
    return feeDistributorsWithBalance
}
