import {getProposers} from "./getProposers";
import {getValidatorIndexesFromBigQuery} from "./getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./getRowsFromBigQuery";
import {ValidatorWithFeeDistributorsAndAmount} from "./models/ValidatorWithFeeDistributorsAndAmount";

export async function getValidatorWithFeeDistributorsAndAmount() {
    const proposers = await getProposers()
    const pubkeys = Object.keys(proposers)
    const pubkeysWithIndexes = await getValidatorIndexesFromBigQuery(pubkeys)
    const val_ids = pubkeysWithIndexes.map(r => r.val_id)
    const indexesWithAmounts = await getRowsFromBigQuery(val_ids)

    const validatorWithFeeDistributorsAndAmounts: ValidatorWithFeeDistributorsAndAmount[] = []
    for (let i = 0; i < pubkeys.length; i++) {
        const val_id = pubkeysWithIndexes.find(r => r.val_pubkey === pubkeys[i])?.val_id
        if (!val_id) {
            throw new Error('val_id not found for ' + pubkeys[i])
        }

        const amount = indexesWithAmounts.find(r => r.val_id === val_id)?.val_amount
        if (!amount) {
            throw new Error('amount not found for ' + pubkeys[i])
        }

        validatorWithFeeDistributorsAndAmounts.push({
            feeDistributor: proposers[pubkeys[i]].fee_recipient,
            pubkey: pubkeys[i],
            val_id,
            amount
        })
    }

    return validatorWithFeeDistributorsAndAmounts
}
