let runDate: Date | null = null

export function getDatedJsonFilePath(name: string) {
    if (runDate === null) {
        runDate = new Date()
    }

    const filePath = process.env.FOLDER_FOR_REPORTS_PATH! + '/' + name + runDate.toISOString() + '.json'
    return filePath
}
