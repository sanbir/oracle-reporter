import {getProposers} from "./getProposers";
import {getValidatorIndexesFromBigQuery} from "./getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./getRowsFromBigQuery";
import {ValidatorWithFeeDistributorsAndAmount} from "./models/ValidatorWithFeeDistributorsAndAmount";
import {logger} from "./helpers/logger";
import {ethers} from "ethers";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";

export async function getValidatorWithFeeDistributorsAndAmount() {
    logger.info('getValidatorWithFeeDistributorsAndAmount started')

    const proposers = await getProposers()
    const pubkeys = Object.keys(proposers)

    logger.info(pubkeys.length + ' pubkeys found')

    const chuckSize = 10000
    const pubkeysWithIndexes: {val_id: number, val_pubkey: string}[] = []
    for (let i = 0; i < pubkeys.length; i++) {
        if (i % chuckSize === 0) {
            const chuck = pubkeys.slice(i, i + chuckSize)
            const pubkeysWithIndexesChunk = await getValidatorIndexesFromBigQuery(chuck)
            pubkeysWithIndexes.push(...pubkeysWithIndexesChunk)
        }
    }

    logger.info(pubkeysWithIndexes.length + ' pubkeysWithIndexes')

    const val_ids = pubkeysWithIndexes.map(r => r.val_id)
    const indexesWithAmounts = await getRowsFromBigQuery(val_ids)

    const validatorWithFeeDistributorsAndAmounts: ValidatorWithFeeDistributorsAndAmount[] = []
    for (let i = 0; i < pubkeys.length; i++) {
        const val_id = pubkeysWithIndexes.find(r => r.val_pubkey === pubkeys[i])?.val_id
        if (!val_id) {
            logger.info('val_id not found for ' + pubkeys[i])
            continue
        }

        const amount = indexesWithAmounts.find(r => r.val_id === val_id)?.val_amount
        if (!amount) {
            logger.info('amount not found for ' + pubkeys[i])
            continue
        }

        validatorWithFeeDistributorsAndAmounts.push({
            feeDistributor: ethers.utils.getAddress(proposers[pubkeys[i]].fee_recipient),
            pubkey: pubkeys[i],
            val_id,
            amount
        })
    }

    const filePath = getDatedJsonFilePath('amounts-for-pubkeys')
    logger.info('Saving amounts-for-pubkeys to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(validatorWithFeeDistributorsAndAmounts))
    logger.info('amounts-for-pubkeys saved')

    logger.info(
        'getValidatorWithFeeDistributorsAndAmount finished with '
        + validatorWithFeeDistributorsAndAmounts.length
        + ' validators'
    )

    return validatorWithFeeDistributorsAndAmounts
}
