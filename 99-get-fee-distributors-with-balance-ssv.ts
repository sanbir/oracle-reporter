import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getFeeDistributorsWithBalanceSsv} from "./scripts/getFeeDistributorsWithBalanceSsv";
import fs from "fs"

async function main() {
    logger.info('99-get-fee-distributors-with-balance-ssv started')

    try {
        const fds = await getFeeDistributorsWithBalanceSsv()

        const aa = fds.map(fd => ({
            fdAddress: fd.fdAddress,
            pubkeys: fd.periods[fd.periods.length - 1].pubkeys
        }))

        console.log(JSON.stringify(aa));

        fs.writeFileSync("SSVFdPubkeys.json", JSON.stringify(aa));
    } catch (error) {
        logger.error(error)
    }
    logger.info('99-get-fee-distributors-with-balance-ssv finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

