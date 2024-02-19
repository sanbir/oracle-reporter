import "dotenv/config"
import {buildMerkleTreeForFeeDistributorAddress} from "./scripts/helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {makeOracleReport} from "./scripts/makeOracleReport";
import {
    getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards";
import {getDatedJsonFilePath} from "./scripts/helpers/getDatedJsonFilePath";

async function main() {
    logger.info('06-report-root-to-oracle-contract started')

    const fds = await getFeeDistributorsWithUpdatedAmountsFromAlreadySplitClRewards()

    const rewardData = fds.map(fd => {
        return [fd.feeDistributor, fd.amount.toString()]
    })

    const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)

    await makeOracleReport(tree.root)
    logger.info('Root reported to the contract: ' + tree.root)

    logger.info('06-report-root-to-oracle-contract finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

