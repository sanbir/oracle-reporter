import {FeeRecipient} from "./FeeRecipient";

export interface ValidatorWithFeeDistributorsAndAmount {
    feeDistributor: string
    pubkey: string
    val_id: number
    amount: number

    referenceFeeDistributor: string
    clientConfig: FeeRecipient
    referrerConfig: FeeRecipient
}
