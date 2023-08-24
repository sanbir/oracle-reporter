import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import fs from "fs"
import {getFeeDistributorsFromLogs} from "./scripts/getFeeDistributorsFromLogs";
import {getProposers} from "./scripts/getProposers";
import {getValidatorIndexesFromBigQuery} from "./scripts/getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./scripts/getRowsFromBigQuery";
import {FeeDistributorValidatorWithAmount} from "./scripts/models/FeeDistributorValidatorWithAmount";
import {FeeDistributorWithAmount} from "./scripts/models/FeeDistributorWithAmount";

async function main() {
    const feeDistributors = await getFeeDistributorsFromLogs()

    const proposers = await getProposers()
    const pubkeys = Object.keys(proposers)
    const pubkeysWithIndexes = await getValidatorIndexesFromBigQuery(pubkeys)
    const val_ids = pubkeysWithIndexes.map(r => r.val_id)
    const indexesWithAmounts = await getRowsFromBigQuery(val_ids)

    const feeDistributorValidators: FeeDistributorValidatorWithAmount[] = []
    for (let i = 0; i < pubkeys.length; i++) {
        const val_id = pubkeysWithIndexes.find(r => r.val_pubkey === pubkeys[i])?.val_id
        if (!val_id) {
            throw new Error('val_id not found for ' + pubkeys[i])
        }

        const amount = indexesWithAmounts.find(r => r.val_id === val_id)?.val_amount
        if (!amount) {
            throw new Error('amount not found for ' + pubkeys[i])
        }

        feeDistributorValidators.push({
            feeDistributor: proposers[pubkeys[i]].fee_recipient,
            pubkey: pubkeys[i],
            val_id,
            amount
        })
    }

    const feeDistributorsWithAmounts = feeDistributorValidators.reduce((
        accumulator: FeeDistributorWithAmount[],
        indexWithAmount
    ) => {
        const existingEntry = accumulator.find(
            entry => entry.feeDistributor === indexWithAmount.feeDistributor
        )

        if (existingEntry) {
            existingEntry.amount += indexWithAmount.amount;
        } else {
            const newEntry: FeeDistributorWithAmount = {
                feeDistributor: indexWithAmount.feeDistributor,
                amount: indexWithAmount.amount
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    // const rewardDataPromises = feeDistributors.map(async fd => {
    //     const amount = await getClRewards(fd)
    //     return [fd, amount.toString()]
    // })
    // const rewardData = await Promise.all(rewardDataPromises)
    // const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)
    // await makeOracleReport('0xe3c1E6958da770fBb492f8b6B85ea00ABb81E8f9', tree.root)
    // // // Send tree.json file to the website and to the withdrawer
    // fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
    //
    // await withdrawAll(feeDistributorFactoryAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

