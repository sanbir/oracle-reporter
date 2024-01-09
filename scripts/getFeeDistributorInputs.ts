import axios from "axios";
import {logger} from "./helpers/logger";
import {FeeDistributorInput} from "./models/FeeDistributorInput";

export async function getFeeDistributorInputs() {
    logger.info('getFeeDistributorInputs started')

    // TODO!!!! Get from DB or API
    const feeDistributorInputs: FeeDistributorInput[] = [
        {
            identityParams: {
                referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                clientConfig: {recipient: '0xf7F2A948119232fA16780ddCa0309D7A0C170eE2', basisPoints: 9500},
                referrerConfig: {recipient: '0x0000000000000000000000000000000000000000', basisPoints: 0},
            },

            pubkeys: [
                '0x802319c26f7e7880262f7d79ef6f4ce1a8318d640e4908ee2c01fda2f08c6c91e9c1c35635cde342d1161cf5dfe28c07',
                '0x8036abaf8caacb301be8dbd41a155887ed531b13efd2148c0260283933cc81ec5ade23ebf6a861f65c66121a909e11d4'
            ],

            startDateIsoString: '2023-10-20T08:32:56.673Z',
            endDateIsoString: '2023-10-30T08:32:56.673Z'
        },
        {
            identityParams: {
                referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                clientConfig: {recipient: '0xf7F2A948119232fA16780ddCa0309D7A0C170eE2', basisPoints: 9000},
                referrerConfig: {recipient: '0x0000000000000000000000000000000000000000', basisPoints: 0},
            },

            pubkeys: [
                '0x802319c26f7e7880262f7d79ef6f4ce1a8318d640e4908ee2c01fda2f08c6c91e9c1c35635cde342d1161cf5dfe28c07',
                '0x8036abaf8caacb301be8dbd41a155887ed531b13efd2148c0260283933cc81ec5ade23ebf6a861f65c66121a909e11d4'
            ],

            startDateIsoString: '2023-09-20T08:32:56.673Z',
            endDateIsoString: '2023-10-20T08:32:56.673Z'
        },
        {
            identityParams: {
                referenceFeeDistributor: '0x7109DeEb07aa9Eed1e2613F88b2f3E1e6C05163f',
                clientConfig: {recipient: '0xdA795b000C29e6F47C2b2A5F3A35c5647695e301', basisPoints: 9500},
                referrerConfig: {recipient: '0x0000000000000000000000000000000000000000', basisPoints: 0},
            },

            pubkeys: [
                '0x8051907630add535de983263f48df29c1c8b98ad5941d3b2ead3529201b992f650face62d34318c4cc6b054a68b6c79d',
                '0x80d85801425b3c32b329118d75b806eeb896a30cfed71ff58aea793a714a2bc212a60aed5a302b16e5cbc61a9f95ffdc',
                '0x81c57c106658d6b84a32cc3e3205f350257cf8a0b7ef56706016832e75636a9b60c6045e809381f9ee8375dd0c4d56d0'
            ],

            startDateIsoString: '2023-11-06T08:32:56.673Z',
            endDateIsoString: null
        },
    ]

    logger.info('getFeeDistributorInputs finished')
    return feeDistributorInputs
}
