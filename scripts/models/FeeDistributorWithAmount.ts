import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";
import {ethers} from "ethers";

export interface FeeDistributorWithAmount {
    feeDistributor: string
    amount: number

    identityParams: FeeDistributorIdentityParams | null

    newClientBasisPoints: number | null
    fdBalance: ethers.BigNumber
}
