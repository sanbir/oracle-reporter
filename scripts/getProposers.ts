import axios from "axios";

export async function getProposers() {
    const result = await axios.get(process.env.FEE_MANAGER_PROPOSERS_URL!)

    const array = result.data.proposer_config as Record<string, {fee_recipient: string}>

    return array
}
