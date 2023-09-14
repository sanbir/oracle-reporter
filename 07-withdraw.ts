import "dotenv/config"
import {buildMerkleTreeForFeeDistributorAddress} from "./scripts/helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {makeOracleReport} from "./scripts/makeOracleReport";
import {withdrawAll} from "./scripts/withdrawAll";
import {
    getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards
} from "./scripts/getFeeDistributorsWithUpdatedAmountsFromLegacyAlreadySplitClRewards";
import {getAllBalances} from "./scripts/getAllBalances";
import {getBalancesDiff} from "./scripts/getBalancesDiff";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

async function main() {
    logger.info('07-withdraw started')

    // @ts-ignore
    const balancesBefore = JSON.parse(fs.readFileSync(process.env.FOLDER_FOR_REPORTS_PATH! + "/balances-before2023-09-14T01:41:10.366Z.json"))

    // @ts-ignore
    const balancesAfter = JSON.parse(fs.readFileSync(process.env.FOLDER_FOR_REPORTS_PATH! + "/balances-after2023-09-14T03:00:08.411Z.json"))

    const balancesDiff = await getBalancesDiff(balancesBefore, balancesAfter)
    const balancesDiffPath = process.env.FOLDER_FOR_REPORTS_PATH! + '/balances-diff' + new Date().toISOString() + '.json'
    logger.info('Saving balances diff to ' + balancesDiffPath)
    fs.writeFileSync(balancesDiffPath, JSON.stringify(balancesDiff))
    logger.info('Balances diff saved')

    logger.info('07-withdraw finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

