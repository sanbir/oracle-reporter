import {getProposers} from "./getProposers";
import {getValidatorIndexesFromBigQuery} from "./getValidatorIndexesFromBigQuery";
import {getRowsFromBigQuery} from "./getRowsFromBigQuery";
import {ValidatorWithFeeDistributorsAndAmount} from "./models/ValidatorWithFeeDistributorsAndAmount";
import {logger} from "./helpers/logger";
import {ethers} from "ethers";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import { getFeeDistributorContract } from "./helpers/getFeeDistributorContract"
import { NewFd } from "./models/NewFd"

export async function getNewFds() {
    logger.info('getNewFds started')

    const proposers = await getProposers()
    const pubkeys = Object.keys(proposers)

    logger.info(pubkeys.length + ' pubkeys found')

    const fee_recipients = new Set<string>()

    for (let i = 0; i < pubkeys.length; i++) {
        fee_recipients.add(ethers.utils.getAddress(proposers[pubkeys[i]].fee_recipient))
    }

    const newFds: NewFd[] = []

    for (const fee_recipient of fee_recipients) {
        const fd = getFeeDistributorContract(fee_recipient)

        try {
            const clientAddress = await fd.client()
            const clientBasisPoints = (await fd.clientBasisPoints()).toNumber()

            const existingNewFd = newFds.find(newFd => newFd.clientAddress === clientAddress)
            if (existingNewFd) {
                const existingOldFd = existingNewFd.oldFeeDistributors.find(old => old.address === fee_recipient)
                if (!existingOldFd) {
                    existingNewFd.oldFeeDistributors.push({
                        address: fee_recipient,
                        clientBasisPoints: clientBasisPoints,
                        type: "middleware",
                    })
                }
            } else {
                const newFd: NewFd = {
                    newFeeDistributorAddress: "",
                    clientAddress: clientAddress,
                    oldFeeDistributors: [
                        {
                            address: fee_recipient,
                            clientBasisPoints: clientBasisPoints,
                            type: "middleware",
                        }
                    ]
                }

                newFds.push(newFd)
            }

        } catch {
            logger.info(fee_recipient, 'is not a FeeDistributor.')
        }
    }

    const filePath = getDatedJsonFilePath('NewFds')
    logger.info('Saving NewFds to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(newFds))
    logger.info('NewFds saved')

    logger.info('getNewFds finished')
}
