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
    logger.info(Object.keys(proposers).length + ' pubkeys found')

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

    const feeDistributorInputs: FeeDistributorInput[] = nonDuplicate.map(d => ({
        identityParams: {
            referenceFeeDistributor: process.env.REFERENCE_FEE_DISTRIBUTOR!,
            clientConfig: {recipient: d.client_fee_recipient, basisPoints: d.client_basis_points},
            // @ts-ignore
            referrerConfig: {recipient: d.referrer_fee_recipient, basisPoints: d['referrer_basis_points'] as number || 0}
        },
        // @ts-ignore
        pubkeys: Object.keys(proposers).filter(key => proposers[key].fee_recipient.toLowerCase() === d.address.toLowerCase()),
        startDateIsoString: d.activated_at,
        endDateIsoString: null
    }))

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}
