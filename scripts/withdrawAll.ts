import { withdrawErc4337 } from "./withdrawErc4337"
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {logger} from "./helpers/logger";
import {withdrawTx} from "./withdrawTx";
import {getUse4337} from "./helpers/getUse4337";
import {getDatedJsonFilePath} from "./helpers/getDatedJsonFilePath";
import fs from "fs";
import {getIsContract} from "./helpers/getIsContract";
import {deployFeeDistributor} from "./deployFeeDistributor";
import { FeeDistributorToWithdraw } from "./models/FeeDistributorToWithdraw"
import { FeeRecipient } from "./models/FeeRecipient"

export async function withdrawAll(feeDistributors: FeeDistributorToWithdraw[], tree: StandardMerkleTree<any[]>) {
    logger.info('withdrawAll started')

    if (!process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI) {
        throw new Error('MIN_BALANCE_TO_WITHDRAW_IN_GWEI not set in ENV')
    }

    const txHashesForFdAddresses: {address: string, hash: string}[] = []

    for (const fd of feeDistributors) {
        try {
            if (fd.fdAddress.toLowerCase() === '0xa136329Bb4c0Af09C5Ad20449E4eb8b60fE65F19'.toLowerCase()) {
                throw new Error('Corrupted address 0xa136329Bb4c0Af09C5Ad20449E4eb8b60fE65F19')
            }

            const isDeployed = await getIsContract(fd.fdAddress)

            if (!isDeployed) {
                if (fd.fdAddress.toLowerCase() === '0x33858b7Db7D0f8986B138aa430703b88FeD64971'.toLowerCase()) {
                    fd.identityParams = {
                        referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                        clientConfig: {
                            recipient: '0xf95Aa110636F466dDEc95598e6c661b921243665',
                            basisPoints: 9500
                        },
                        referrerConfig: {
                            recipient: '0x0000000000000000000000000000000000000000',
                            basisPoints: 0
                        }
                    }
                }
                if (fd.fdAddress.toLowerCase() === '0xFC42dC2244E78a8A3b39f63608A7c28b7EC06973'.toLowerCase()) {
                    fd.identityParams = {
                        referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                        clientConfig: {
                            recipient: '0x9d4fd64FEB016eAb2EE450703F4eFc1b2Eb14deB',
                            basisPoints: 9500
                        },
                        referrerConfig: {
                            recipient: '0x0000000000000000000000000000000000000000',
                            basisPoints: 0
                        }
                    }
                }
                if (fd.fdAddress.toLowerCase() === '0x6C027ca67b36F36704ae7950679CFf639A05ec8D'.toLowerCase()) {
                    fd.identityParams = {
                        referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                        clientConfig: {
                            recipient: '0xAa41cA850323660e85aF507548449f3abA2B5A19',
                            basisPoints: 9500
                        },
                        referrerConfig: {
                            recipient: '0x0000000000000000000000000000000000000000',
                            basisPoints: 0
                        }
                    }
                }
                if (fd.fdAddress.toLowerCase() === '0x56009B0cEBD8336CcfE20E4bC1059F67033922F1'.toLowerCase()) {
                    fd.identityParams = {
                        referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                        clientConfig: {
                            recipient: '0x7a65A5ca6e241f7DF9Cd66113245c9Cf41D9B60f',
                            basisPoints: 9500
                        },
                        referrerConfig: {
                            recipient: '0x0000000000000000000000000000000000000000',
                            basisPoints: 0
                        }
                    }
                }
                if (fd.fdAddress.toLowerCase() === '0xa4fA38F3cae331041cf93A88730C6595cBC447a2'.toLowerCase()) {
                    fd.identityParams = {
                        referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                        clientConfig: {
                            recipient: '0x5B3eF7Ed14AB4a240b8290D86a5b1e662E1D618C',
                            basisPoints: 9500
                        },
                        referrerConfig: {
                            recipient: '0x0000000000000000000000000000000000000000',
                            basisPoints: 0
                        }
                    }
                }

                if (!fd.identityParams) {
                    throw new Error('No identityParams for ' + fd.fdAddress)
                }
                const deployHash = await deployFeeDistributor(fd)
                txHashesForFdAddresses.push({address: fd.fdAddress, hash: deployHash})
            }

            let withdrawHash = ''
            const use4337 = getUse4337()
            if (use4337) {
                withdrawHash = await withdrawErc4337(fd.fdAddress, tree)
            } else {
                withdrawHash = await withdrawTx(fd.fdAddress, tree)
            }
            txHashesForFdAddresses.push({address: fd.fdAddress, hash: withdrawHash})

        } catch (error) {
            logger.error(error)
        }
    }

    const filePath = getDatedJsonFilePath('tx-hashes-for-fd-addresses')
    logger.info('Saving tx-hashes-for-fd-addresses to ' + filePath)
    fs.writeFileSync(filePath, JSON.stringify(txHashesForFdAddresses))
    logger.info('tx-hashes-for-fd-addresses saved')

    logger.info('withdrawAll finished')

    return txHashesForFdAddresses
}
