import {Balances} from "./models/Balances";

export function getBalancesDiff(balancesBefore: Balances, balancesAfter: Balances): Balances {

    const feeDistributors = balancesAfter.feeDistributors.map(
        fdAfter => {
            const fdBefore = balancesBefore.feeDistributors.find(
                fdB => fdB.feeDistributor.address === fdAfter.feeDistributor.address
            )

            if (!fdBefore) {
                throw new Error("Should never happen")
            }

            return {
                feeDistributor: {
                    address: fdAfter.feeDistributor.address,
                    balance: fdAfter.feeDistributor.balance - fdBefore.feeDistributor.balance
                },
                client: {
                    address: fdAfter.client.address,
                    balance: fdAfter.client.balance - fdBefore.client.balance
                }
            }
        }
    )

    const diff: Balances = {
        feeDistributors,
        p2pAddress: "0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff",
        p2pAddressBalance: balancesAfter.p2pAddressBalance - balancesBefore.p2pAddressBalance
    }

    return diff
}
