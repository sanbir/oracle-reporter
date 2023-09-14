import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";
import {getEOAsForAll} from "./scripts/getEOAsForAll";

async function main() {
    logger.info('99-test started')

    const eoas = await getEOAsForAll()

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/eoas' + new Date().toISOString() + '.json'
    logger.info('Saving report to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(eoas))
    logger.info('Report saved')

    logger.info('99-test finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

