import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";
import {getProposers} from "./getProposers";
import {getDistributorsFromApi} from "./getDistributorsFromApi";

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

    const nonDuplicate = withoutInvoices.filter((obj, index, self) => {
        return index === self.findIndex((t) => (
            t.address === obj.address
            && t.client_basis_points === obj.client_basis_points
            && t.activated_at === obj.activated_at
        ))
    })
    logger.info(nonDuplicate.length + ' distributors without invoices and duplicates')

    const clientPubkeys = pubkeys.map(p => ({
        pubkey: p,
        // @ts-ignore
        client: nonDuplicate.find(d => d.address.toLowerCase() === proposers[p].fee_recipient.toLowerCase())?.client_fee_recipient
    }))

    // @ts-ignore
    nonDuplicate.sort((a, b) => new Date(a.activated_at) - new Date(b.activated_at))

    const now = new Date()

    const feeDistributorInputs: FeeDistributorInput[] = nonDuplicate.map(d => {

        // @ts-ignore
        const referrerConfig = {recipient: d.referrer_fee_recipient, basisPoints: d['referrer_basis_points'] as number || 0}

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

            startDate: d.activated_at === "2024-01-31T00:00:00.000Z" ? new Date("2024-01-31T20:20:00.000Z") : new Date(d.activated_at),
            endDate
        }
    })

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}
