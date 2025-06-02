import "dotenv/config"
import {logger} from "./scripts/helpers/logger";
import { NewFd } from "./scripts/models/NewFd"
import { getFeeDistributorContract } from "./scripts/helpers/getFeeDistributorContract"
import { getDatedJsonFilePath } from "./scripts/helpers/getDatedJsonFilePath"
import fs from "fs"
import { deployDeoracleizedFeeDistributor } from "./scripts/deployDeoracleizedFeeDistributor"
import { predictDeoracleizedFeeDistributor } from "./scripts/predictDeoracleizedFeeDistributor"
import { setInitialNonce } from "./scripts/helpers/nonce"
import { getIsContract } from "./scripts/helpers/getIsContract"
import { ethers } from "ethers"

async function main() {
    logger.info('96-2-list started')

    await setInitialNonce()

    const newFds: NewFd[] = []

    // @ts-ignore
    const maybeFds: Record<string, string[]> = JSON.parse(fs.readFileSync('./wrong_dist.json'))
    const maybeFdAddresses = Object.keys(maybeFds).map(addr => ethers.utils.getAddress(addr.toLowerCase()))

    for (const maybeFdAddress of maybeFdAddresses) {
        const f = getFeeDistributorContract(maybeFdAddress)
        try {
            const client = await f.client()
            const clientBasisPoints = (await f.clientBasisPoints()).toNumber()

            const newFd: NewFd = {
                "newFeeDistributorAddress": "",
                "clientAddress": client,
                "oldFeeDistributors": [
                    {
                        "address": maybeFdAddress,
                        "clientBasisPoints": clientBasisPoints,
                        "type": "middleware"
                    }
                ]
            }

            newFds.push(newFd)
        } catch (error) {
            logger.error(error)
            logger.info(maybeFdAddress, 'is not a FD')
        }
    }

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

    const filePath = getDatedJsonFilePath('activeValidatorsWithWrongDists__fixed')
    logger.info('Saving newFds to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(newFds))
    logger.info('newFds saved')

    logger.info('96-2-list finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

