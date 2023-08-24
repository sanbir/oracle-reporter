import {getFactory} from "./helpers/getFactory";

export async function getFeeDistributorsFromLogs() {
    const factory = getFactory()

    const filter = factory.filters.FeeDistributorFactory__FeeDistributorCreated(null, null)

    let result = await factory.queryFilter(filter, 0, "latest");

    return result.map(event => event?.args?._newFeeDistributorAddress)
}
