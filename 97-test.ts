import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getRowsFromBigQuery} from "./scripts/getRowsFromBigQuery";
import { PROPOSERS } from "./scripts/helpers/PROPOSERS";
import { getFeeDistributorInputs } from "./scripts/getFeeDistributorInputs"
import { getFdAddressesWithPeriodsFromApi } from "./scripts/getFdAddressesWithPeriodsFromApi"

async function main() {
    logger.info('97-test started')

    const fds = await getFdAddressesWithPeriodsFromApi()


    logger.info('97-test finished')
}



async function test_manualSetup() {
    const pubkeysWithData = PROPOSERS.proposer_config

    const pubkeys = Object.keys(pubkeysWithData)

    // @ts-ignore
    const aa = pubkeys.filter(p => pubkeysWithData[p].fee_recipient === '0x0b1ddf6d1da69532ad4198470679b0b49176c68f')

    const feeDistributorInputs = await getFeeDistributorInputs()

    const input = feeDistributorInputs.find(f => f.fdAddress === '0x0b1Ddf6D1DA69532Ad4198470679b0b49176c68f')

    const newKeys = input?.periods[0].pubkeys

    const res = aa.filter(a => !newKeys?.some(n => n === a))
}

async function test_getRowsFromBigQuery() {
    const indexesWithAmounts = await getRowsFromBigQuery(
        [1217607],
        new Date('2024-02-01'),
        new Date('2024-03-01')
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

