import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";

async function main() {
    logger.info('03-fee-distributors-with-legacy-already-split-amounts started')

    const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/fee-distributors-with-legacy-already-split-amounts' + new Date() + '.json'
    logger.info('Saving report to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(fds))
    logger.info('Report saved')

    logger.info('03-fee-distributors-with-legacy-already-split-amounts finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

