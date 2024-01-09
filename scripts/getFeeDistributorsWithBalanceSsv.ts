import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {predictFeeDistributorAddress} from "./predictFeeDistributorAddress";
import {FeeDistributorToWithdraw} from "./models/FeeDistributorToWithdraw";
import {getSsvFeeDistributorFactoryAddress} from "./ssv/getSsvFeeDistributorFactoryAddress";
import {getP2pSsvProxyAddresses} from "./ssv/getP2pSsvProxyAddresses";
import {getSsvFeeRecipientAddressesPerProxy} from "./ssv/getSsvFeeRecipientAddressesPerProxy";

export async function getFeeDistributorsWithBalanceSsv() {
    logger.info('getFeeDistributorsWithBalanceSsv started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error("No MIN_BALANCE_TO_WITHDRAW_IN_GWEI in ENV")
    }

    const feeDistributorFactoryAddress = await getSsvFeeDistributorFactoryAddress()
    const proxyAddresses = await getP2pSsvProxyAddresses()

    for (const proxyAddress of proxyAddresses) {
        const feeRecipientAddressesWithTimestamps = await getSsvFeeRecipientAddressesPerProxy(proxyAddress)
    }

    // 1. read P2pSsvProxyFactory getFeeDistributorFactory
    // 2. read P2pSsvProxyFactory__P2pSsvProxyCreated events, get _p2pSsvProxy addresses from them
    // 3. loop proxies and for each
    // 4. read SSVNetwork's FeeRecipientAddressUpdated events for indexed owner == proxy, get recipientAddress from them
    // 5. fetch block.timestamp for each event and figure out from and to for each fee distributor
    // 6. read SSVNetwork's ValidatorAdded events for indexed owner == proxy, get publicKey from them

    const feeDistributorsWithBalance: FeeDistributorToWithdraw[] = []

    for (const feeDistributorsAddress of feeDistributorsAddresses) {
        try {

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

                identityParams: null,
                pubkeys: input.pubkeys,

                startDateIso: new Date(input.startDateIsoString),
                endDateIso: input.endDateIsoString ? new Date(input.endDateIsoString) : null,
            })
        } catch (error) {
            logger.error(error)
        }
    }

    logger.info('getFeeDistributorsWithBalanceSsv finished')
    return feeDistributorsWithBalance
}
