import {getValidatorIndexesFromBigQuery} from "./getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./getRowsFromBigQuery";
import {ValidatorWithFeeDistributorsAndAmount} from "./models/ValidatorWithFeeDistributorsAndAmount";
import {logger} from "./helpers/logger";
import {ethers} from "ethers";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getFeeDistributorInputs} from "./getFeeDistributorInputs";
import {getFeeDistributorsWithBalance} from "./getFeeDistributorsWithBalance";

export async function getValidatorWithFeeDistributorsAndAmount() {
    logger.info('getValidatorWithFeeDistributorsAndAmount started')

    const feeDistributorInputs = await getFeeDistributorInputs()

    const feeDistributorsWithBalance = await getFeeDistributorsWithBalance(feeDistributorInputs)
    logger.info(feeDistributorsWithBalance.length + ' feeDistributorsWithBalance')

    const validatorWithFeeDistributorsAndAmounts: ValidatorWithFeeDistributorsAndAmount[] = []

    for (const fd of feeDistributorsWithBalance) {
        const pubkeys = Array.from(fd.pubkeys)

        logger.info(pubkeys.length + ' pubkeys for ' + fd.address)

        const pubkeysWithIndexes = await getValidatorIndexesFromBigQuery(pubkeys)

        logger.info(pubkeysWithIndexes.length + ' pubkeysWithIndexes for ' + fd.address)

        const val_ids = pubkeysWithIndexes.map(r => r.val_id)
        const indexesWithAmounts = await getRowsFromBigQuery(val_ids, fd.startDateIso, fd.endDateIso || new Date())

        for (let i = 0; i < pubkeys.length; i++) {
            const val_id = pubkeysWithIndexes.find(r => r.val_pubkey === pubkeys[i])?.val_id
            if (!val_id) {
                logger.info('val_id not found for ' + pubkeys[i])
                continue
            }

            let amount = indexesWithAmounts.find(r => r.val_id === val_id)?.val_amount
            if (!amount) {
                logger.info('amount not found for ' + pubkeys[i])
                continue
            }

            validatorWithFeeDistributorsAndAmounts.push({
                feeDistributor: ethers.utils.getAddress(fd.address),
                identityParams: fd.identityParams,

                pubkey: pubkeys[i],
                val_id,
                amount,

                newClientBasisPoints: fd.newClientBasisPoints,
                fdBalance: fd.balance
            })
        }
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
