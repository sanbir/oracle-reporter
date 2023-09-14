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
                    balance: ethers.utils.formatEther(ethers.utils.parseEther(fdAfter.feeDistributor.balance).sub(ethers.utils.parseEther(fdBefore.feeDistributor.balance)))
                },
                client: {
                    address: fdAfter.client.address,
                    balance: ethers.utils.formatEther(ethers.utils.parseEther(fdAfter.client.balance).sub(ethers.utils.parseEther(fdBefore.client.balance)))
                }
            }
        }
    )

    const diff: Balances = {
        feeDistributors,
        p2pAddress: "0x6Bb8b45a1C6eA816B70d76f83f7dC4f0f87365Ff",
        p2pAddressBalance: ethers.utils.formatEther(ethers.utils.parseEther(balancesAfter.p2pAddressBalance).sub(ethers.utils.parseEther(balancesBefore.p2pAddressBalance)))
    }

    return diff
}
