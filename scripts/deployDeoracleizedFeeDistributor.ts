import { ContractTransaction, ethers } from "ethers"
import {getNonce, incrementNonce} from "./helpers/nonce";
import { getFeeDistributorFactoryContractSigned_3_1 } from "./helpers/getFeeDistributorFactoryContract_3_1"
import { logger } from "./helpers/logger"

export async function deployDeoracleizedFeeDistributor(
  clientAddress: string
) {
  logger.info('deployDeoracleizedFeeDistributor started for', clientAddress)

    const factory = getFeeDistributorFactoryContractSigned_3_1()
    const referenceFd = process.env.REFERENCE_FEE_DISTRIBUTOR_3_1_DEORACLEIZED

    const clientConfig = {
      recipient: clientAddress,
      basisPoints: 0
    }

    const referrerConfig = {
      recipient: ethers.constants.AddressZero,
      basisPoints: 0
    }

    const tx: ContractTransaction = await factory.createFeeDistributor(
        referenceFd,
        clientConfig,
        referrerConfig, {
            gasLimit: 300000,
            maxFeePerGas: process.env.MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: process.env.MAX_PIORITY_FEE_PER_GAS,
            nonce: getNonce()
        }
    )

    incrementNonce()

  logger.info('deployDeoracleizedFeeDistributor finished for', clientAddress)

    return tx.hash
}
