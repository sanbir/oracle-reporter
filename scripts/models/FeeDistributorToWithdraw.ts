import {BaseFeeDistributorToWithdraw} from "./BaseFeeDistributorToWithdraw";
import {FeeDistributorIdentityParams} from "./FeeDistributorIdentityParams";

export interface FeeDistributorToWithdraw extends BaseFeeDistributorToWithdraw {
    identityParams: FeeDistributorIdentityParams | null
}
