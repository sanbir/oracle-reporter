import {getOracleContract} from "./helpers/getOracleContract";

export async function makeOracleReport(root: string) {
    const oracle = getOracleContract()

    await oracle.report(root)
}
