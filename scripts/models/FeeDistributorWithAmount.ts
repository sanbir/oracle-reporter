import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";

export interface FeeDistributorWithAmount {
    feeDistributor: string
    amount: number

    identityParams: FeeDistributorIdentityParams | null
}
