import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";
import {ethers} from "ethers";

export interface FeeDistributorWithAmountForPeriod {
    feeDistributor: string
    amount: number

    identityParams: FeeDistributorIdentityParams | null

    newClientBasisPoints: number
    fdBalance: ethers.BigNumber

    startDate: Date
    endDate: Date
}
