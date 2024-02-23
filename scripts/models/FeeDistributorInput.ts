import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";

export interface FeeDistributorInput {
    fdAddress: string
    identityParams: FeeDistributorIdentityParams | null

    pubkeys: Set<string>

    startDate: Date
    endDate: Date
}
