import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getFeeDistributorsWithBalanceSsv} from "./scripts/getFeeDistributorsWithBalanceSsv";
import { getFeeDistributorContract } from "./scripts/helpers/getFeeDistributorContract"
import { NewFd } from "./scripts/models/NewFd"
import { getDatedJsonFilePath } from "./scripts/helpers/getDatedJsonFilePath"
import fs from "fs"

async function main() {
    logger.info('99-get-fee-distributors-with-balance-ssv started')

    try {
        const {feeDistributorsWithBalance: fds, now} = await getFeeDistributorsWithBalanceSsv()
        const currentFds = fds.filter(f => f.periods.some(p => p.endDate === now))

        const newFds: NewFd[] = []

        for(const currentFd of currentFds) {
            const f = getFeeDistributorContract(currentFd.fdAddress)
            try {
                const client = await f.client()
                const clientBasisPoints = (await f.clientBasisPoints()).toNumber()

                const sameClientFd = newFds.find(
                  nfd => nfd.clientAddress.toLowerCase() === client.toLowerCase()
                )
                if (sameClientFd) {
                    sameClientFd.oldFeeDistributors.push(
                      {
                          address: currentFd.fdAddress,
                          clientBasisPoints: clientBasisPoints,
                          type: 'ssvNew'
                      }
                    )
                } else {
                    newFds.push({
                        newFeeDistributorAddress: "",
                        clientAddress: client,
                        oldFeeDistributors: [
                            {
                                address: currentFd.fdAddress,
                                clientBasisPoints: clientBasisPoints,
                                type: 'ssvNew'
                            }
                        ]
                    })
                }

            } catch (e){
                console.error('Error in ' + currentFd.fdAddress)
                console.error(e)
            }
        }


        const filePath = getDatedJsonFilePath('newFdsSSV_OLD')
        logger.info('Saving newFds to ' + filePath)
        fs.writeFileSync(filePath, JSON.stringify(newFds))
        logger.info('newFds saved')

    } catch (error) {
        logger.error(error)
    }
    logger.info('99-get-fee-distributors-with-balance-ssv finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

