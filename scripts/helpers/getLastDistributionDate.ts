import { logger } from "./logger"
import { getIsContract } from "./getIsContract"
import { getFeeDistributorContract } from "./getFeeDistributorContract"
import { ethers } from "ethers"
import { sleep } from "./sleep"

export async function getLastDistributionDate(fdAddress: string) : Promise<Date | null> {
  try {
    logger.info('getLastDistributionDate started for ' + fdAddress)

    const isContract = await getIsContract(fdAddress)
    if (!isContract) {
      return null
    }

    const fd = getFeeDistributorContract(fdAddress)

    const logs = await fd.queryFilter(fd.filters.FeeDistributor__Withdrawn(), 19009010, "latest")

    if (logs.length === 0) {
      return null
    }

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    const withdrawalDates = await Promise.all(logs.map(async (log) => {
      const block = await provider.getBlock(log.blockNumber)
      return new Date(block.timestamp * 1000) // Convert Unix timestamp to JavaScript Date
    }));

    const maxDate = withdrawalDates.reduce((max, date) => date > max ? date : max)

    logger.info('getLastDistributionDate finished for ' + fdAddress)

    return maxDate
  } catch (error) {
    logger.error(error)
    logger.info('sleeping for 5 sec...')
    await sleep(5000)
    return await getLastDistributionDate(fdAddress)
  }
}