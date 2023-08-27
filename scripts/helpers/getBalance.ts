import {ethers} from "ethers";

export async function getBalance(address: string) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    const balance = await provider.getBalance(address)

    return balance
}
