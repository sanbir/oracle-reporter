import {getOracleContract} from "./helpers/getOracleContract";
import {getNonce, incrementNonce} from "./helpers/nonce";

export async function makeOracleReport(root: string) {
    const oracle = getOracleContract()

    await oracle.report(root, {nonce: getNonce()})

    incrementNonce()
}
