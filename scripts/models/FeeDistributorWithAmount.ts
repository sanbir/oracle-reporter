import {FeeRecipient} from "./FeeRecipient";

export interface FeeDistributorWithAmount {
    feeDistributor: string
    amount: number

    referenceFeeDistributor: string
    clientConfig: FeeRecipient
    referrerConfig: FeeRecipient
}
