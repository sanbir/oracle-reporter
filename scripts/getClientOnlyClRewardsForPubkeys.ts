import {getValidatorIndexesFromBigQuery} from "./getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./getRowsFromBigQuery";
import {logger} from "./helpers/logger";

export async function getClientOnlyClRewardsForPubkeys(pubkeys: string[]) {
    logger.info('getClientOnlyClRewardsForPubkeys started')

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
    const indexesWithAmounts = await getRowsFromBigQuery(val_ids, new Date())

    const clientOnlyClRewards = indexesWithAmounts.reduce(
        (acc, item) => acc + item.val_amount, 0
    )

    logger.info(
        'getClientOnlyClRewardsForPubkeys finished. clientOnlyClRewards = ' + clientOnlyClRewards
    )

    return clientOnlyClRewards
}
