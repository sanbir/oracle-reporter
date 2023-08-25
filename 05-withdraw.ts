import "dotenv/config"
import {FeeDistributorWithAmount} from "./scripts/models/FeeDistributorWithAmount";
import {getValidatorWithFeeDistributorsAndAmount} from "./scripts/getValidatorWithFeeDistributorsAndAmount";
import {buildMerkleTreeForFeeDistributorAddress} from "./scripts/helpers/buildMerkleTreeForFeeDistributorAddress";
import {logger} from "./scripts/helpers/logger";
import fs from "fs";
import {makeOracleReport} from "./scripts/makeOracleReport";
import {withdrawAll} from "./scripts/withdrawAll";

async function main() {
    logger.info('05-withdraw started')

    const validatorWithFeeDistributorsAndAmounts = await getValidatorWithFeeDistributorsAndAmount()

    const feeDistributorsWithAmounts = validatorWithFeeDistributorsAndAmounts.reduce((
        accumulator: FeeDistributorWithAmount[],
        validator
    ) => {
        const existingEntry = accumulator.find(
            entry => entry.feeDistributor === validator.feeDistributor
        )

        if (existingEntry) {
            existingEntry.amount += validator.amount;
        } else {
            const newEntry: FeeDistributorWithAmount = {
                feeDistributor: validator.feeDistributor,
                amount: validator.amount
            }

            accumulator.push(newEntry);
        }

        return accumulator;
    }, [])

    const rewardData = feeDistributorsWithAmounts.map(fd => {
        return [fd.feeDistributor, fd.amount.toString()]
    })

    const tree = buildMerkleTreeForFeeDistributorAddress(rewardData)

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/merkle-tree' + new Date() + '.json'
    logger.info('Saving merkle tree to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(tree.dump()))
    logger.info('Merkle tree saved')

    await makeOracleReport(tree.root)
    logger.info('Root reported to the contract: ' + tree.root)

    const feeDistributorFactoryAddress = feeDistributorsWithAmounts.map(fd => fd.feeDistributor)
    await withdrawAll(feeDistributorFactoryAddress, tree)

    logger.info('05-withdraw finished')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

