import "dotenv/config"
import express, { Request, Response } from 'express'
import fs from 'fs'
import {logger} from "./scripts/helpers/logger";
import {withdraw} from "./scripts/withdraw";
import {getDatedJsonFilePath, getRunDate, resetRunDate} from "./scripts/helpers/getDatedJsonFilePath";
import {reTryWithdrawWithExistingTree} from "./scripts/reTryWithdrawWithExistingTree";
import {fetchWithdrawTxStatusesFromChain} from "./scripts/fetchWithdrawTxStatusesFromChain";
import {setClientOnlyClRewards} from "./scripts/setClientOnlyClRewards";

const app = express()

app.get('/', (req: Request, res: Response) => {
    res.send('Oracle reporter server')
})

app.get('/amounts-for-pubkeys', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('amounts-for-pubkeys')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/fee-distributors-with-legacy-already-split-amounts', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('fee-distributors-with-legacy-already-split-amounts')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/fee-distributors-with-amounts-from-db', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('fee-distributors-with-amounts-from-db')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/merkle-tree', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('merkle-tree')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/tx-hashes-for-fd-addresses', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('tx-hashes-for-fd-addresses')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/balances-before', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('balances-before')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/balances-after', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('balances-after')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/balances-diff', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('balances-diff')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.get('/tx-statuses', async (req: Request, res: Response) => {
    const filePath = getDatedJsonFilePath('tx-statuses')

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found.')
        return
    }

    res.sendFile(filePath)
})

app.post('/withdraw', async (req: Request, res: Response) => {
    logger.info('withdraw started')

    resetRunDate()

    logger.info(process.env.RPC_URL)
    logger.info(process.env.ORACLE_ADDRESS)
    logger.info(process.env.MAX_FEE_PER_GAS)
    logger.info(process.env.MAX_PIORITY_FEE_PER_GAS)
    logger.info(process.env.STACKUP_API_KEY)
    logger.info(process.env.KEY_FILE_NAME)
    logger.info(process.env.FEE_MANAGER_PROPOSERS_URL)
    logger.info(process.env.IS_TESTNET)
    logger.info(process.env.USE_ERC_4337)
    logger.info(process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI)
    logger.info(process.env.FOLDER_FOR_REPORTS_PATH)
    logger.info(getRunDate().toISOString())

    res.status(200).send('withdraw started at ' + getRunDate().toISOString())

    await withdraw()

    logger.info('withdraw finished')
})

app.post('/re-try-withdraw', async (req: Request, res: Response) => {
    logger.info('re-try-withdraw started')

    console.log(process.env.RPC_URL)
    console.log(process.env.ORACLE_ADDRESS)
    console.log(process.env.MAX_FEE_PER_GAS)
    console.log(process.env.MAX_PIORITY_FEE_PER_GAS)
    console.log(process.env.STACKUP_API_KEY)
    console.log(process.env.KEY_FILE_NAME)
    console.log(process.env.FEE_MANAGER_PROPOSERS_URL)
    console.log(process.env.IS_TESTNET)
    console.log(process.env.USE_ERC_4337)
    console.log(process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI)
    console.log(process.env.FOLDER_FOR_REPORTS_PATH)
    console.log(getRunDate().toISOString())

    res.status(200).send('re-try-withdraw started at ' + getRunDate().toISOString())

    await reTryWithdrawWithExistingTree()

    logger.info('re-try-withdraw finished')
})

app.post('/fetch-withdraw-tx-statuses-from-chain', async (req: Request, res: Response) => {
    logger.info('fetch-withdraw-tx-statuses-from-chain started')

    console.log(process.env.RPC_URL)
    console.log(process.env.ORACLE_ADDRESS)
    console.log(process.env.MAX_FEE_PER_GAS)
    console.log(process.env.MAX_PIORITY_FEE_PER_GAS)
    console.log(process.env.STACKUP_API_KEY)
    console.log(process.env.KEY_FILE_NAME)
    console.log(process.env.FEE_MANAGER_PROPOSERS_URL)
    console.log(process.env.IS_TESTNET)
    console.log(process.env.USE_ERC_4337)
    console.log(process.env.MIN_BALANCE_TO_WITHDRAW_IN_GWEI)
    console.log(process.env.FOLDER_FOR_REPORTS_PATH)
    console.log(getRunDate().toISOString())

    res.status(200).send('fetch-withdraw-tx-statuses-from-chain started at ' + getRunDate().toISOString())

    await fetchWithdrawTxStatusesFromChain()

    logger.info('fetch-withdraw-tx-statuses-from-chain finished')
})

app.post('/set-client-only-cl-rewards', async (req: Request, res: Response) => {
    const feeDividerAddress = req.query['feeDividerAddress'] as string
    if (!feeDividerAddress) {
        res.status(404).send('No feeDividerAddress is query string')
        return
    }
    logger.info('feeDividerAddress: ' + feeDividerAddress)

    const endDateIsoString = req.query['endDateIsoString'] as string
    let endDate = new Date()
    logger.info('endDateIsoString: ' + endDateIsoString)
    if (endDateIsoString) {
        endDate = new Date(endDateIsoString)
    }

    let rawData = ''
    req.on('data', chunk => {
        rawData += chunk
    })

    req.on('end', async () => {
        if (!rawData) {
            res.status(404).send('No pubkeys in request body')
        } else {
            const pubkeys = rawData.split('\n')
            logger.info('pubkeys: ' + pubkeys)

            res.status(200).send('set-client-only-cl-rewards started at ' + new Date().toISOString())

            await setClientOnlyClRewards(feeDividerAddress, pubkeys, new Date('2023-08-01'), endDate)
        }
    })
})

app.listen(process.env.PORT, () => console.log('Server started on port', process.env.PORT))
