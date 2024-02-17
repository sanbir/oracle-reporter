import {ethers} from "ethers";
import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";
import {getIsContract} from "./helpers/getIsContract";

export async function getAlreadySplitClRewards(address: string) {
    const isContract = await getIsContract(address)
    if (!isContract) {
        return 0
    }

    const fd = getFeeDistributorContract(address)
    const alreadySplitClRewards = await fd.clientOnlyClRewards()
    return (alreadySplitClRewards as ethers.BigNumber).div(1e9).toNumber()
}
