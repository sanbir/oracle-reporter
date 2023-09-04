export function getIsGoerli() {
    if (!process.env.IS_TESTNET) {
        throw new Error('No IS_TESTNET is ENV')
    }

    return String(process.env.IS_TESTNET).toLowerCase() == "true"
}
