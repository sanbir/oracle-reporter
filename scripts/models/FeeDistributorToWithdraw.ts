import {FeeRecipient} from "./FeeRecipient";

export interface FeeDistributorToWithdraw {
    address: string

    referenceFeeDistributor: string
    clientConfig: FeeRecipient
    referrerConfig: FeeRecipient

    pubkeys: string[]

    startDateIso: Date
    endDateIso: Date | null
}
