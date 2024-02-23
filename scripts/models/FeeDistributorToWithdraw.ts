import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";
import {ethers} from "ethers";

export interface FeeDistributorToWithdraw {
    identityParams: FeeDistributorIdentityParams | null

    address: string

    pubkeys: Set<string>

    startDateIso: Date
    endDateIso: Date | null

    balance: ethers.BigNumber

    newClientBasisPoints: number | null
}
