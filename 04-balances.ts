import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";
import {getAllBalances} from "./scripts/getAllBalances";

async function main() {
    logger.info('04-balances started')

    const fds = await getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards()

    const feeDistributorsAddresses = fds.map(fd => fd.feeDistributor)

    await getAllBalances(feeDistributorsAddresses, 'balances-before')

    logger.info('04-balances finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

