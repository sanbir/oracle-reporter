import {
    getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards
} from "./getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards";
import {buildMerkleTreeForFeeDistributorAddress} from "./helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./helpers/logger";
import {makeOracleReport} from "./makeOracleReport";
import {withdrawAll} from "./withdrawAll";
import {setInitialNonce} from "./helpers/nonce";

export async function withdraw() {
    try {
        await setInitialNonce()

        let fds = await getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards()

        fds = fds.filter(fd =>
          fd.fdAddress.toLowerCase() === '0x33858b7Db7D0f8986B138aa430703b88FeD64971'.toLowerCase() ||
          fd.fdAddress.toLowerCase() === '0xFC42dC2244E78a8A3b39f63608A7c28b7EC06973'.toLowerCase() ||
          fd.fdAddress.toLowerCase() === '0x6C027ca67b36F36704ae7950679CFf639A05ec8D'.toLowerCase() ||
          fd.fdAddress.toLowerCase() === '0x56009B0cEBD8336CcfE20E4bC1059F67033922F1'.toLowerCase() ||
          fd.fdAddress.toLowerCase() === '0xa4fA38F3cae331041cf93A88730C6595cBC447a2'.toLowerCase()
        )

        const rewardData = fds.map(fd => {
            return [fd.fdAddress, fd.amount.toString()]
        })

        const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)

        await makeOracleReport(tree.root)
        logger.info('Root reported to the contract: ' + tree.root)

        await withdrawAll(fds, tree)
    } catch (error) {
        logger.error(error)
    }
}
