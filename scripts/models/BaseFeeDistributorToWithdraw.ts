export interface BaseFeeDistributorToWithdraw {
    address: string

    pubkeys: string[]

    startDateIso: Date
    endDateIso: Date | null
}
