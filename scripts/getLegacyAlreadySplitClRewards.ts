import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";
import {ethers} from "ethers";
import {logger} from "./helpers/logger";
import {getIsGoerli} from "./helpers/getIsGoerli";
import {getIsContract} from "./helpers/getIsContract";

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
    try {
        const clientOnlyClRewards = await feeDistributor.clientOnlyClRewards()
    } catch {
        throw new Error(address + ' is not an OracleFeeDistributor. Will not split rewards')
    }

    let withdrawSelector = '';
    try {
        withdrawSelector = await feeDistributor.withdrawSelector()
    } catch {
        throw new Error(address + ' is not a V3 FeeDistributor. Will not split rewards')
    }
    if (withdrawSelector !== '0xdd83edc3') {
        throw new Error(address + ' is not a V3 OracleFeeDistributor. Will not split rewards')
    }

    const eventSignature = ethers.utils.id("OracleFeeDistributor__ClientOnlyClRewardsUpdated(uint256)");

    const isGoerli = getIsGoerli()

    const fromBlock = isGoerli ? 9451631: 17822992
    const toBlock = isGoerli ? 'latest': 17869702

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    const filter = {
        address,
        fromBlock,
        toBlock,
        topics: [ eventSignature ]
    };

    const logs = await provider.getLogs(filter)

    if (!logs.length) {
        logger.info('No OracleFeeDistributor__ClientOnlyClRewardsUpdated logs found for ' + address
            + '.\nLegacyAlreadySplitClRewards is 0.')
        return 0
    } else {
        const log = logs[0]
        const decodedLog = new ethers.utils.Interface(['event OracleFeeDistributor__ClientOnlyClRewardsUpdated(uint256 _clientOnlyClRewards)']).parseLog(log);
        const legacyAlreadySplitClRewards = decodedLog.args._clientOnlyClRewards
        return (legacyAlreadySplitClRewards as ethers.BigNumber).div(1e9).toNumber()
    }
}
