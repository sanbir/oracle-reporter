import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {predictFeeDistributorAddress} from "./predictFeeDistributorAddress";
import {FeeDistributorToWithdraw} from "./models/FeeDistributorToWithdraw";

export async function getFeeDistributorsWithBalance(feeDistributorInputs: FeeDistributorInput[]) {
    logger.info('getFeeDistributorsWithBalance started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error("No MIN_BALANCE_TO_WITHDRAW_IN_GWEI in ENV")
    }

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
                continue
            }

            feeDistributorsWithBalance.push({
                address: feeDistributorsAddress,

                identityParams: input.identityParams,
                pubkeys: input.pubkeys,

                startDateIso: input.startDate,
                endDateIso: input.endDate,

                balance
            })
        } catch (error) {
            logger.error(error)
        }
    }

    logger.info('getFeeDistributorsWithBalance finished')
    return feeDistributorsWithBalance
}
