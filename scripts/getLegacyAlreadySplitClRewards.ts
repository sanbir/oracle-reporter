import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";
import {getIsContract} from "./helpers/getIsContract";
import {ethers} from "ethers";

// Needed to allow the new CL rewadrs query to work with the old values stored in contracts
export async function getLegacyAlreadySplitClRewards(address: string) {
    const isContract = await getIsContract(address)
    if (!isContract) {
        throw new Error(address + ' is an EOA, not a FeeDistributor. Will not split rewards')
    }

    const feeDistributor = getFeeDistributorContract(address)

    try {
        const client = await feeDistributor.client()
    } catch {
        throw new Error(address + ' is not a FeeDistributor. Will not split rewards')
    }

    let withdrawSelector = '';
    try {
        withdrawSelector = await feeDistributor.withdrawSelector()
    } catch {
        // Might be a V2 FeeDistributor
    }
    if (withdrawSelector === '0xdd83edc3') {
        throw new Error(address + ' is a V3 OracleFeeDistributor. Will not split rewards')
    }

    try {
        const legacyAlreadySplitClRewards = await feeDistributor.clientOnlyClRewards()

        return (legacyAlreadySplitClRewards as ethers.BigNumber).div(1e9).toNumber()
    } catch {
        throw new Error(address + ' is not an OracleFeeDistributor. Will not split rewards')
    }
}
