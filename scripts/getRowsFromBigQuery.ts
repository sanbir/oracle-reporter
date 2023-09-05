import { BigQuery } from "@google-cloud/bigquery"
import {logger} from "./helpers/logger";
import {getIsGoerli} from "./helpers/getIsGoerli";

export async function getRowsFromBigQuery(valIds: number[]): Promise<{val_id: number, val_amount: number}[]> {
    logger.info('Getting amounts from BigQuery for ' + valIds.length + ' pubkeys')

    const isGoerli = getIsGoerli()

    const bigquery = new BigQuery()

    const query = `
        SELECT val_id, sum(
            COALESCE(att_earned_reward, 0) + 
            COALESCE(propose_earned_reward, 0) + 
            COALESCE(sync_earned_reward, 0) - 
            COALESCE(att_penalty, 0) - 
            COALESCE(propose_penalty, 0) - 
            COALESCE(sync_penalty, 0)
        ) as val_amount 
        FROM \`p2p-data-warehouse.raw_ethereum.testnet_validators_summary\`
        WHERE val_id IN (${valIds})
        GROUP BY val_id
    `

    const [job] = await bigquery.createQueryJob({
        query: query,
        location: "US"
    })
    const [rows] = await job.getQueryResults()

    logger.info('Amounts from BigQuery fetched for ' + rows.length + ' pubkeys')

    return rows
}
