import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";

export interface ValidatorWithFeeDistributorsAndAmount {
    feeDistributor: string
    pubkey: string
    val_id: number
    amount: number

    identityParams: FeeDistributorIdentityParams | null
}
