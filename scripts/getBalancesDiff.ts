import {Balances} from "./models/Balances";
import {ethers} from "ethers";

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
                    balance: ethers.BigNumber.from(fdAfter.feeDistributor.balance).sub(ethers.BigNumber.from(fdBefore.feeDistributor.balance)).toString()
                },
                client: {
                    address: fdAfter.client.address,
                    balance: ethers.BigNumber.from(fdAfter.client.balance).sub(ethers.BigNumber.from(fdBefore.client.balance)).toString()
                }
            }
        }
    )

    const diff: Balances = {
        feeDistributors,
        p2pAddress: "0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff",
        p2pAddressBalance: ethers.BigNumber.from(balancesAfter.p2pAddressBalance).sub(ethers.BigNumber.from(balancesBefore.p2pAddressBalance)).toString()
    }

    return diff
}
