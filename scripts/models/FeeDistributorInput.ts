import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";

export interface FeeDistributorInput {
    identityParams: FeeDistributorIdentityParams | null

    pubkeys: string[]

    startDateIsoString: string
    endDateIsoString: string | null
}
