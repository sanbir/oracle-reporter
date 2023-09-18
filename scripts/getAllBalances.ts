import {logger} from "./helpers/logger";
import fs from "fs";
import {Balances} from "./models/Balances";
import {getBalance} from "./helpers/getBalance";
import {ethers} from "ethers";
import {AddressBalance} from "./models/AddressBalance";
import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";

const p2pAddress = '0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff'

export async function getAllBalances(feeDistributorsAddresses: string[], kindOfBalances: string) {
    logger.info('getAllBalances started')

    const feeDistributorsWithBalances: {
        feeDistributor: AddressBalance
        client: AddressBalance
    }[] = []

    for (const fdAddress of feeDistributorsAddresses) {
        logger.info('Getting balances for ' + fdAddress)

        const fdBalanceInWei = await getBalance(fdAddress)
        const fdBalance = ethers.utils.formatEther(fdBalanceInWei)
        const feeDistributor = getFeeDistributorContract(fdAddress)
        const clientAddress = await feeDistributor.client()
        const clientBalanceInWei = await getBalance(clientAddress)
        const clientBalance = ethers.utils.formatEther(clientBalanceInWei)

        feeDistributorsWithBalances.push({
            feeDistributor: {
                address: fdAddress, balance: fdBalance
            }, client: {
                address: clientAddress, balance: clientBalance
            }
        })
    }

    const p2pAddressBalanceInWei = await getBalance('0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff')
    const p2pAddressBalance = ethers.utils.formatEther(p2pAddressBalanceInWei)

    const balances: Balances = {
        feeDistributors: feeDistributorsWithBalances, p2pAddress, p2pAddressBalance
    }

    const filePath = getDatedJsonFilePath(kindOfBalances)
    logger.info('Saving ' + kindOfBalances + ' to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(balances))
    logger.info(kindOfBalances + ' saved')

    logger.info('getAllBalances finished')

    return balances
}
