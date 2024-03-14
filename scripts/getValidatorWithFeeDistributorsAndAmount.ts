import {getValidatorIndexesFromBigQuery} from "./getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./getRowsFromBigQuery";
import {logger} from "./helpers/logger";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getFeeDistributorInputs} from "./getFeeDistributorInputs";
import {getFeeDistributorsWithBalance} from "./getFeeDistributorsWithBalance";

export async function getValidatorWithFeeDistributorsAndAmount() {
    logger.info('getValidatorWithFeeDistributorsAndAmount started')

    const feeDistributorInputs = await getFeeDistributorInputs()

    const feeDistributorsWithBalance = await getFeeDistributorsWithBalance(feeDistributorInputs)
    logger.info(feeDistributorsWithBalance.length + ' feeDistributorsWithBalance')

    for (const fd of feeDistributorsWithBalance) {
        let fdAmount = 0

        for (const period of fd.periods) {
            const pubkeys = period.pubkeys

            logger.info(pubkeys.length + ' pubkeys for ' + fd.fdAddress + ' '
              + period.startDate.toISOString() + ' ' + period.endDate.toISOString()
            )

            const pubkeysWithIndexes = await getValidatorIndexesFromBigQuery(pubkeys)

            logger.info(pubkeysWithIndexes.length + ' pubkeysWithIndexes for ' + fd.fdAddress + ' '
              + period.startDate.toISOString() + ' ' + period.endDate.toISOString()
            )

            const val_ids = pubkeysWithIndexes.map(r => r.val_id)
            const indexesWithAmounts = await getRowsFromBigQuery(
              val_ids,
              period.startDate,
              period.endDate
            )

            let periodAmount = 0

            for (const pubkey of pubkeys) {
                const val_id = pubkeysWithIndexes.find(r => r.val_pubkey === pubkey)?.val_id
                if (!val_id) {
                    logger.info('val_id not found for ' + pubkey)
                    continue
                }

                let amount = indexesWithAmounts.find(r => r.val_id === val_id)?.val_amount
                if (!amount) {
                    logger.info('amount not found for ' + pubkey)
                    continue
                }

                logger.info(pubkey + ' amount = ' + amount)

                periodAmount += amount
            }

            fdAmount += periodAmount
        }

        fd.amount = fdAmount
    }

    const filePath = getDatedJsonFilePath('amounts-for-pubkeys')
    logger.info('Saving amounts-for-pubkeys to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(feeDistributorsWithBalance))
    logger.info('amounts-for-pubkeys saved')

    return feeDistributorsWithBalance
}
