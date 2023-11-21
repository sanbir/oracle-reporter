import {FeeRecipient} from "./FeeRecipient";

export interface FeeDistributorIdentityParams {
    referenceFeeDistributor: string
    clientConfig: FeeRecipient
    referrerConfig: FeeRecipient
}
