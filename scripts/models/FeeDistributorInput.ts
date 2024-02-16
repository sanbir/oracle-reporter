import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";

export interface FeeDistributorInput {
    fdAddress: string
    identityParams: FeeDistributorIdentityParams | null

    pubkeys: string[]

    startDate: Date
    endDate: Date
}
