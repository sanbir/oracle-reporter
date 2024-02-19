import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";
import {ethers} from "ethers";

export interface ValidatorWithFeeDistributorsAndAmount {
    feeDistributor: string
    pubkey: string
    val_id: number
    amount: number

    identityParams: FeeDistributorIdentityParams | null

    newClientBasisPoints: number | null
    fdBalance: ethers.BigNumber
}
