import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";

async function main() {
    logger.info('03-fee-distributors-with-legacy-already-split-amounts started')

    await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

    logger.info('03-fee-distributors-with-legacy-already-split-amounts finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

