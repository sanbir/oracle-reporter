let __runDate: Date | null = null

export function getRunDate() {
    if (__runDate === null) {
        __runDate = new Date()
    }

    return __runDate
}

export function resetRunDate() {
    __runDate = null
}

export function getDatedJsonFilePath(name: string) {
    const runDate = getRunDate()

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/' + name + runDate.toISOString() + '.json'
    return filePath
}
