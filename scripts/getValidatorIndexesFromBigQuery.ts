import {BigQuery} from "@google-cloud/bigquery";
import {logger} from "./helpers/logger";

export async function getValidatorIndexesFromBigQuery(val_pubkeys: string[]): Promise<{val_id: number, val_pubkey: string}[]> {
    logger.info('Getting indexes from BigQuery for ' + val_pubkeys.length + ' pubkeys')

    const bigquery = new BigQuery()

    const query = `
        SELECT val_id, val_pubkey FROM \`p2p-data-warehouse.raw_ethereum.${process.env.IS_TESTNET ? 'testnet_' : ''}validators_index\`
        WHERE val_pubkey IN (${"'" + val_pubkeys.join("','") + "'"})
    `

    const [job] = await bigquery.createQueryJob({
        query: query,
        location: "US"
    })
    const [rows] = await job.getQueryResults()

    logger.info('Indexes from BigQuery fetched for ' + rows.length + ' pubkeys')

    return rows
}
