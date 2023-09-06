import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";
import {getAllBalances} from "./scripts/getAllBalances";
import fs from "fs";

async function main() {
    logger.info('04-balances started')

    const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

    const feeDistributorsAddresses = fds.map(fd => fd.feeDistributor)

    const balances = await getAllBalances(feeDistributorsAddresses)

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/balances-before' + new Date() + '.json'
    logger.info('Saving report to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(balances))
    logger.info('Report saved')

    logger.info('04-balances finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
