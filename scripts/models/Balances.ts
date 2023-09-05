import {AddressBalance} from "./AddressBalance";

export interface Balances {
    feeDistributors: {
        feeDistributor: AddressBalance
        client: AddressBalance
    }[]
    p2pAddress: '0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff'
    p2pAddressBalance: number
}
