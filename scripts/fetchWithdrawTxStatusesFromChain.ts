import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getTransactionStatus} from "./helpers/getTransactionStatus";
import {logger} from "./helpers/logger";

export async function fetchWithdrawTxStatusesFromChain() {
    const filePath = getDatedJsonFilePath('tx-hashes-for-fd-addresses')

    // @ts-ignore
    const txHashesForFdAddresses: {address: string, hash: string}[] = JSON.parse(fs.readFileSync(filePath))

    const withStatuses: {address: string, hash: string, status: string}[] = []
    for (const {address, hash} of txHashesForFdAddresses) {
        const status = await getTransactionStatus(hash)

        withStatuses.push({address, hash, status})
    }

    const txStatusesFilePath = getDatedJsonFilePath('tx-statuses')
    logger.info('Saving tx-statuses to ' + txStatusesFilePath)
    fs.writeFileSync(filePath, JSON.stringify(withStatuses))
    logger.info('tx-statuses saved')
}
