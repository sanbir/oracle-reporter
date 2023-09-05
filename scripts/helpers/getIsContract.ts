import {ethers} from "ethers";

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

export async function getIsContract(address: string) {
    const code = await provider.getCode(address)
    return !!(code && code.length > 2) // '0x' is the prefix for an empty string
}
