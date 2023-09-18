export function getUse4337() {
    if (!process.env.USE_ERC_4337) {
        throw new Error('No USE_ERC_4337 is ENV')
    }

    return String(process.env.USE_ERC_4337).toLowerCase() == "true"
}
