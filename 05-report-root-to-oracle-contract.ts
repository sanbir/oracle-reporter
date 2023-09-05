import "dotenv/config"
import {buildMerkleTreeForFeeDistributorAddress} from "./scripts/helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {makeOracleReport} from "./scripts/makeOracleReport";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";

async function main() {
    logger.info('05-report-root-to-oracle-contract started')

    const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

    const rewardData = fds.map(fd => {
        return [fd.feeDistributor, fd.amount.toString()]
    })

    const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/merkle-tree' + new Date() + '.json'
    logger.info('Saving merkle tree to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(tree.dump()))
    logger.info('Merkle tree saved')

    await makeOracleReport(tree.root)
    logger.info('Root reported to the contract: ' + tree.root)

    logger.info('05-report-root-to-oracle-contract finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

