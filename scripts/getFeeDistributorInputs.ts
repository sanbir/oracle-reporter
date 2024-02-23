import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getDistributorsFromApi} from "./getDistributorsFromApi";
import {DepositManagerApiDistributor} from "./models/DepositManagerApiDistributor";
import {getPubkeysForSessionFromApi} from "./getPubkeysForSessionFromApi";

export async function getFeeDistributorInputs() {
    logger.info('getFeeDistributorInputs started')

    if (!process.env.REFERENCE_FEE_DISTRIBUTOR) {
        throw new Error("No REFERENCE_FEE_DISTRIBUTOR in ENV")
    }

    const fromApi = await getDistributorsFromApi()
    logger.info(fromApi.length + ' distributors from API')

    const withoutInvoices = fromApi.filter(d => d.address !== d.client_fee_recipient)
    logger.info(withoutInvoices.length + ' distributors without invoices')

    const groupedByClient = withoutInvoices.reduce((acc: {[key: string]: DepositManagerApiDistributor[]}, item: DepositManagerApiDistributor) => {
        const key = item.client_fee_recipient
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(item)
        return acc
    }, {})

    const now = new Date()
    const feeDistributorInputs: FeeDistributorInput[] = []

    for (const key of Object.keys(groupedByClient)) {
        groupedByClient[key].sort((a, b) =>
            new Date(a.activated_at).getTime() - new Date(b.activated_at).getTime()
        );

        for (const session of groupedByClient[key]) {
            session.pubkeys = new Set(await getPubkeysForSessionFromApi(session.session_id))
        }

        const nonDuplicateForClient = getNonDuplicates(groupedByClient[key])
        nonDuplicateForClient.sort((a, b) => new Date(a.activated_at).getTime() - new Date(b.activated_at).getTime())

        const feeDistributorInputsForClient: FeeDistributorInput[] = nonDuplicateForClient.map(d => {

            const referrerConfig = {
                recipient: d.referrer_fee_recipient,
                // @ts-ignore
                basisPoints: d['referrer_basis_points'] as number || 0
            }

            logger.info(d.pubkeys.size + ' pubkeys for ' + d.client_fee_recipient)

            let endDate = now

            const sameClientFds = nonDuplicateForClient.filter(
                nd => nd.id !== d.id
            )

            if (sameClientFds.length) {
                const laterFd = sameClientFds.find(
                    fd => new Date(fd.activated_at) > new Date(d.activated_at)
                )

                if (laterFd) {
                    endDate = new Date(laterFd.activated_at)
                }
            }

            return {
                fdAddress: d.address,

                identityParams: {
                    referenceFeeDistributor: process.env.REFERENCE_FEE_DISTRIBUTOR!,
                    clientConfig: {recipient: d.client_fee_recipient, basisPoints: d.client_basis_points},
                    referrerConfig
                },

                pubkeys: d.pubkeys,

                startDate: new Date(d.activated_at) <= new Date("2024-01-31T20:20:00.000Z")
                    ? new Date("2024-01-31T20:20:00.000Z")
                    : new Date(d.activated_at),

                endDate: endDate <= new Date("2024-01-31T20:20:00.000Z")
                    ? new Date("2024-01-31T20:20:00.000Z")
                    : endDate
            }
        })

        feeDistributorInputs.push(...feeDistributorInputsForClient)
    }

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}

function getNonDuplicates(withoutInvoices: DepositManagerApiDistributor[]) {
    const result: DepositManagerApiDistributor[] = [];
    let lastUniqueCombo = null;

    for (const item of withoutInvoices) {
        const currentCombo = `${item.address}|${item.client_basis_points}`;

        // If the current combination is different from the last unique combination
        if (currentCombo !== lastUniqueCombo) {
            result.push(item); // Include this item
            lastUniqueCombo = currentCombo; // Update last unique combination
        } else {
            item.pubkeys.forEach(pk => {
                result[result.length - 1].pubkeys.add(pk)
            })
        }
    }

    return result;
}
