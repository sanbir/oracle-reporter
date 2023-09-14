import {getFeeDistributorContract} from "./helpers/getFeeDistributorContract";
import {ethers} from "ethers";
import {logger} from "./helpers/logger";
import {getIsGoerli} from "./helpers/getIsGoerli";
import {getIsContract} from "./helpers/getIsContract";

// Needed to allow the new CL rewadrs query to work with the old values stored in contracts
export async function getEOAs(address: string) {
    const isContract = await getIsContract(address)
    if (!isContract) {
        return address
    }

    throw new Error(address + ' is NOT an EOA')
}
