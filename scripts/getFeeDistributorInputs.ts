import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getProposers} from "./getProposers";
import {getDistributorsFromApi} from "./getDistributorsFromApi";
import {DepositManagerApiDistributor} from "./models/DepositManagerApiDistributor";

export async function getFeeDistributorInputs() {
    logger.info('getFeeDistributorInputs started')

    if (!process.env.REFERENCE_FEE_DISTRIBUTOR) {
        throw new Error("No REFERENCE_FEE_DISTRIBUTOR in ENV")
    }

    const proposers = await getProposers()
    const pubkeys = Object.keys(proposers)
    logger.info(pubkeys.length + ' pubkeys found')

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

    const nonDuplicate: DepositManagerApiDistributor[] = []

    Object.keys(groupedByClient).forEach(key => {
        groupedByClient[key].sort((a, b) =>
            new Date(a.activated_at).getTime() - new Date(b.activated_at).getTime()
        );

        const nonDuplicateForClient = getNonDuplicates(groupedByClient[key])
        nonDuplicate.push(...nonDuplicateForClient)
    });

    logger.info(nonDuplicate.length + ' distributors without invoices and duplicates')

    nonDuplicate.sort((a, b) => new Date(a.activated_at).getTime() - new Date(b.activated_at).getTime())

    const clientPubkeys = pubkeys.map(p => ({
        pubkey: p,
        // @ts-ignore
        client: nonDuplicate.find(d => d.address.toLowerCase() === proposers[p].fee_recipient.toLowerCase())?.client_fee_recipient
    }))

    const now = new Date()

    const feeDistributorInputs: FeeDistributorInput[] = nonDuplicate.map(d => {

        const referrerConfig = {
            recipient: d.referrer_fee_recipient,
            // @ts-ignore
            basisPoints: d['referrer_basis_points'] as number || 0
        }

        const pubkeys = clientPubkeys
            .filter(cpk => cpk.client?.toLowerCase() === d.client_fee_recipient.toLowerCase())
            .map(cpk => cpk.pubkey)

        logger.info(pubkeys.length + ' pubkeys for ' + d.client_fee_recipient)

        let endDate = now

        const sameClientFds = nonDuplicate.filter(
            nd => nd.client_fee_recipient.toLowerCase() === d.client_fee_recipient.toLowerCase()
                && nd.id !== d.id
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

            pubkeys,

            startDate: new Date(d.activated_at) <= new Date("2024-01-31T20:20:00.000Z")
                ? new Date("2024-01-31T20:20:00.000Z")
                : new Date(d.activated_at),

            endDate: endDate <= new Date("2024-01-31T20:20:00.000Z")
                ? new Date("2024-01-31T20:20:00.000Z")
                : endDate
        }
    })

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}

function getNonDuplicates(withoutInvoices: DepositManagerApiDistributor[]) {
    const result = [];
    let lastUniqueCombo = null;

    for (const item of withoutInvoices) {
        const currentCombo = `${item.address}|${item.client_basis_points}`;

        // If the current combination is different from the last unique combination
        if (currentCombo !== lastUniqueCombo) {
            result.push(item); // Include this item
            lastUniqueCombo = currentCombo; // Update last unique combination
        }
    }

    return result;
}
