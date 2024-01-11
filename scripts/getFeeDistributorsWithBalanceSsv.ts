import {logger} from "./helpers/logger";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {FeeDistributorToWithdraw} from "./models/FeeDistributorToWithdraw";
import {getP2pSsvProxyAddresses} from "./ssv/getP2pSsvProxyAddresses";
import {getSsvPubKeysPerProxy} from "./ssv/getSsvPubKeysPerProxy";
import {
    getSsvFeeRecipientAddressesWithTimestampsPerProxy
} from "./ssv/getSsvFeeRecipientAddressesWithTimestampsPerProxy";

export async function getFeeDistributorsWithBalanceSsv() {
    logger.info('getFeeDistributorsWithBalanceSsv started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error("No MIN_BALANCE_TO_WITHDRAW_IN_GWEI in ENV")
    }

    const feeDistributors: {recipientAddress: string, from: Date, to: Date | null, pubkeys: string[]}[] = []

    const proxyAddresses = await getP2pSsvProxyAddresses()

    for (const proxyAddress of proxyAddresses) {
        const feeRecipientAddressesWithTimestamps = await getSsvFeeRecipientAddressesWithTimestampsPerProxy(proxyAddress)
        const pubkeys = await getSsvPubKeysPerProxy(proxyAddress)

        // First Pass: Group by recipientAddress and find the minimum timestamp for each group.
        const minTimestampsByRecipient: { [key: string]: Date } = {};
        feeRecipientAddressesWithTimestamps.forEach(({ recipientAddress, timestamp }) => {
            if (!minTimestampsByRecipient[recipientAddress]) {
                minTimestampsByRecipient[recipientAddress] = timestamp;
            } else if (timestamp < minTimestampsByRecipient[recipientAddress]) {
                minTimestampsByRecipient[recipientAddress] = timestamp;
            }
        })

        // Second Pass: Determine the 'to' value for each group.
        const groupedByRecipientAddress: { [key: string]: { from: Date; to: Date | null } } = {};

        feeRecipientAddressesWithTimestamps.forEach(({ recipientAddress, timestamp }) => {
            if (!groupedByRecipientAddress[recipientAddress]) {
                groupedByRecipientAddress[recipientAddress] = { from: minTimestampsByRecipient[recipientAddress], to: null };
            }

            for (const [otherAddress, otherTimestamp] of Object.entries(minTimestampsByRecipient)) {
                if (otherAddress !== recipientAddress) {
                    if (groupedByRecipientAddress[recipientAddress].to === null || otherTimestamp < groupedByRecipientAddress[recipientAddress].to!) {
                        groupedByRecipientAddress[recipientAddress].to = otherTimestamp;
                    }
                }
            }
        })

        const feeDistributorsPerProxy = Object.keys(groupedByRecipientAddress).map(recipientAddress => ({
            recipientAddress,
            from: groupedByRecipientAddress[recipientAddress].from,
            to: groupedByRecipientAddress[recipientAddress].to,
            pubkeys
        }))

        feeDistributors.push(...feeDistributorsPerProxy)
    }

    const feeDistributorsWithBalance: FeeDistributorToWithdraw[] = []

    for (const fd of feeDistributors) {
        try {

            const balance = await getBalance(fd.recipientAddress)
            logger.info(
                'Balance of '
                + fd.recipientAddress
                + ' is '
                + ethers.utils.formatUnits(balance, "ether")
                + 'ETH'
            )

            if (balance.lt(ethers.utils.parseUnits(process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI, "gwei"))) {
                logger.info(
                    'Balance of '
                    + fd.recipientAddress
                    + ' is less than minimum to withdraw. Will not withdraw.'
                )
                continue
            }

            feeDistributorsWithBalance.push({
                address: fd.recipientAddress,

                identityParams: null,
                pubkeys: fd.pubkeys,

                startDateIso: fd.from,
                endDateIso: fd.from !== fd.to ? fd.to : null,
            })
        } catch (error) {
            logger.error(error)
        }
    }

    logger.info('getFeeDistributorsWithBalanceSsv finished')
    return feeDistributorsWithBalance
}
