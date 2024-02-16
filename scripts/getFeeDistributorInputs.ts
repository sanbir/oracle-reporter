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

        const sameClientFds = nonDuplicate.filter(nd => nd.client_fee_recipient.toLowerCase() === d.client_fee_recipient.toLowerCase())

        return {
            fdAddress: d.address,

            identityParams: {
                referenceFeeDistributor: process.env.REFERENCE_FEE_DISTRIBUTOR!,
                clientConfig: {recipient: d.client_fee_recipient, basisPoints: d.client_basis_points},
                // @ts-ignore
                referrerConfig: {recipient: d.referrer_fee_recipient, basisPoints: d['referrer_basis_points'] as number || 0}
            },

            pubkeys: clientPubkeys
                .filter(cpk => cpk.client === d.client_fee_recipient.toLowerCase())
                .map(cpk => cpk.pubkey),

            startDate: new Date(d.activated_at),
            endDate: sameClientFds.length === 1
                ? now
                : new Date(sameClientFds[sameClientFds.indexOf(d) + 1].activated_at)
        }
    })

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}
