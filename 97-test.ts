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
import path from "path"
import { deployFeeDistributor } from "./scripts/deployFeeDistributor"
import { deployDeoracleizedFeeDistributor } from "./scripts/deployDeoracleizedFeeDistributor"
import { deployDeoracleizedFeeDistributorSSV } from "./scripts/deployDeoracleizedFeeDistributorSSV"
import { predictDeoracleizedFeeDistributorSSV } from "./scripts/predictDeoracleizedFeeDistributorSSV"
import { predictDeoracleizedFeeDistributor } from "./scripts/predictDeoracleizedFeeDistributor"
import { setInitialNonce } from "./scripts/helpers/nonce"
import { getIsContract } from "./scripts/helpers/getIsContract"

async function main() {
    logger.info('97-test started')

    await setInitialNonce()

    const newFds: NewFd[] = []

    // @ts-ignore
    const FdsManual: NewFd[] = JSON.parse(fs.readFileSync('./FdsManual.json'))
    // @ts-ignore
    const FdsMiddlewareDeployed: NewFd[] = JSON.parse(fs.readFileSync('./FdsMiddlewareDeployed.json'))
    // @ts-ignore
    const FdsMiddlewarePredicted: NewFd[] = JSON.parse(fs.readFileSync('./FdsMiddlewarePredicted.json'))
    // @ts-ignore
    const FdsSsvNew: NewFd[] = JSON.parse(fs.readFileSync('./FdsSsvNew.json'))
    // @ts-ignore
    const FdsSsvOld: NewFd[] = JSON.parse(fs.readFileSync('./FdsSsvOld.json'))

    for (const f of FdsManual) {
        const existingClient = newFds.find(fd => fd.clientAddress === f.clientAddress)
        if (existingClient) {
            existingClient.oldFeeDistributors.push(...f.oldFeeDistributors)
        } else {
            newFds.push(f)
        }
    }
    for (const f of FdsMiddlewareDeployed) {
        const existingClient = newFds.find(fd => fd.clientAddress === f.clientAddress)
        if (existingClient) {
            existingClient.oldFeeDistributors.push(...f.oldFeeDistributors)
        } else {
            newFds.push(f)
        }
    }
    for (const f of FdsMiddlewarePredicted) {
        const existingClient = newFds.find(fd => fd.clientAddress === f.clientAddress)
        if (existingClient) {
            existingClient.oldFeeDistributors.push(...f.oldFeeDistributors)
        } else {
            newFds.push(f)
        }
    }
    for (const f of FdsSsvNew) {
        const existingClient = newFds.find(fd => fd.clientAddress === f.clientAddress)
        if (existingClient) {
            existingClient.oldFeeDistributors.push(...f.oldFeeDistributors)
        } else {
            newFds.push(f)
        }
    }
    for (const f of FdsSsvOld) {
        const existingClient = newFds.find(fd => fd.clientAddress === f.clientAddress)
        if (existingClient) {
            existingClient.oldFeeDistributors.push(...f.oldFeeDistributors)
        } else {
            newFds.push(f)
        }
    }

    newFds.forEach(n => {
        n.oldFeeDistributors = n.oldFeeDistributors.filter(o => o.address !== n.oldFeeDistributors[0].address || o === n.oldFeeDistributors[0])
    })

    logger.info('separate',
      FdsManual.length +
      FdsMiddlewareDeployed.length +
      FdsMiddlewarePredicted.length +
      FdsSsvNew.length +
      FdsSsvOld.length
    )
    logger.info('together',
      newFds.length
    )

    for (const newFd of newFds) {
        const newFeeDistributorAddress = await predictDeoracleizedFeeDistributor(newFd.clientAddress)

        const isContract = await getIsContract(newFeeDistributorAddress)

        if (!isContract) {
            await deployDeoracleizedFeeDistributor(newFd.clientAddress)
        }

        newFd.newFeeDistributorAddress = newFeeDistributorAddress
    }

    const filePath = getDatedJsonFilePath('ALLFds')
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

