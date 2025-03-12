import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import {getRowsFromBigQuery} from "./scripts/getRowsFromBigQuery";
import { getFeeDistributorInputs } from "./scripts/getFeeDistributorInputs"
import { getFdAddressesWithPeriodsFromApi } from "./scripts/getFdAddressesWithPeriodsFromApi"
import { getLastDistributionDate } from "./scripts/helpers/getLastDistributionDate"
import {
    getSsvFeeRecipientAddressesWithTimestampsPerProxy
} from "./scripts/ssv/getSsvFeeRecipientAddressesWithTimestampsPerProxy"
import { NewFd } from "./scripts/models/NewFd"
import { getFeeDistributorContract } from "./scripts/helpers/getFeeDistributorContract"
import { getDatedJsonFilePath } from "./scripts/helpers/getDatedJsonFilePath"
import fs from "fs"

async function main() {
    logger.info('97-test started')

    const {feeDistributorInputs, now} = await getFeeDistributorInputs()

    const newFds: NewFd[] = []

    for (const fd of feeDistributorInputs) {
        if (fd.identityParams) {
            const active = fd.periods.find(p => p.endDate === now)
            if (active) {
                const f = getFeeDistributorContract(fd.fdAddress)
                try {
                    const clientBasisPoints = await f.clientBasisPoints()
                } catch (e){
                    const sameClientFd = newFds.find(
                      nfd => nfd.clientAddress.toLowerCase() === fd.identityParams?.clientConfig.recipient.toLowerCase()
                    )
                    if (sameClientFd) {
                        sameClientFd.oldFeeDistributors.push(
                          {
                              address: fd.fdAddress,
                              clientBasisPoints: fd.identityParams.clientConfig.basisPoints,
                              type: 'middleware'
                          }
                        )
                    } else {
                        newFds.push({
                            newFeeDistributorAddress: "",
                            clientAddress: fd.identityParams.clientConfig.recipient,
                            oldFeeDistributors: [
                                {
                                    address: fd.fdAddress,
                                    clientBasisPoints: fd.identityParams.clientConfig.basisPoints,
                                    type: 'middleware'
                                }
                            ]
                        })
                    }
                }
            }
        }

    }

    const filePath = getDatedJsonFilePath('newFds')
    logger.info('Saving newFds to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(newFds))
    logger.info('newFds saved')

    logger.info('97-test finished')
}

async function test_getRowsFromBigQuery() {
    const indexesWithAmounts = await getRowsFromBigQuery(
        [1217607],
        new Date('2024-02-01'),
        new Date('2024-03-01')
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

