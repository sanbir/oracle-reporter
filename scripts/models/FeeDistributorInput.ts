import {FeeRecipient} from "./FeeRecipient";

export interface FeeDistributorInput {
    referenceFeeDistributor: string
    clientConfig: FeeRecipient
    referrerConfig: FeeRecipient

    pubkeys: string[]

    startDateIsoString: string
    endDateIsoString: string | null
}
