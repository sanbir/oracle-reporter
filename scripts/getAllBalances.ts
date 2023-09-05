import {logger} from "./helpers/logger";
import fs from "fs";
import {Balances} from "./models/Balances";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {AddressBalance} from "./models/AddressBalance";
import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";

const p2pAddress = '0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff'

export async function getAllBalances(feeDistributorsAddresses: string[]) {
    logger.info('getAllBalances started')

    const feeDistributorsWithBalances: {
        feeDistributor: AddressBalance
        client: AddressBalance
    }[] = []

    for (const fdAddress of feeDistributorsAddresses) {
        logger.info('Getting balances for ' + fdAddress)

        const fdBalanceInWei = await getBalance(fdAddress)
        const fdBalance = fdBalanceInWei.div(10e18).toNumber()
        const feeDistributor = getFeeDistributorContract(fdAddress)
        const clientAddress = await feeDistributor.client()
        const clientBalanceInWei = await getBalance(clientAddress)
        const clientBalance = clientBalanceInWei.div(10e18).toNumber()

        feeDistributorsWithBalances.push({
            feeDistributor: {
                address: fdAddress, balance: fdBalance
            }, client: {
                address: clientAddress, balance: clientBalance
            }
        })
    }

    const p2pAddressBalanceInWei = await getBalance('0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff')
    const p2pAddressBalance = p2pAddressBalanceInWei.div(10e18).toNumber()

    const balances: Balances = {
        feeDistributors: feeDistributorsWithBalances, p2pAddress, p2pAddressBalance
    }

    logger.info('getAllBalances finished')

    return balances
}
