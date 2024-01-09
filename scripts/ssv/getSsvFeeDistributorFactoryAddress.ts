import {logger} from "../helpers/logger";
import {getP2pSsvProxyFactoryContract} from "../helpers/getP2pSsvProxyFactoryContract";

export async function getSsvFeeDistributorFactoryAddress() {
    logger.info('getSsvFeeDistributorFactoryAddress started')

    const p2pSsvProxyFactory = getP2pSsvProxyFactoryContract()

    const feeDistributorFactoryAddress = await p2pSsvProxyFactory.getFeeDistributorFactory()

    logger.info('getSsvFeeDistributorFactoryAddress finished')

    return feeDistributorFactoryAddress
}
