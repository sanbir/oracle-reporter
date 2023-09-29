# oracle-reporter

## HTTP service

Start the server
```shell
npm start
```

##### Split fees for all
`POST http://localhost:3000/withdraw`

##### Migrate a fee divider with withdrawn CL rewards
`POST http://localhost:3000/set-client-only-cl-rewards?feeDividerAddress=0x248C94Ad02a524B1540A98191e51B91c56C262b3&endDateIsoString=2023-09-14`

In this example, 
- `0x248C94Ad02a524B1540A98191e51B91c56C262b3` is the address of the new fee divider
- (Optional) `2023-09-14` is the date when the new fee divider was set as EL fee recipient. If not passed, current date (today) will be used.

Body example (plain-text pubkeys 1 per line):
```
0xa81d51e107a109a6e7924e837086ac87d7e5a6701a0b072e5bb91472b65add29e1e6389a232d688107f0ab91325082e1
0xb6491ec1ba2f14f76079994f4570113d5ad60fea8209bec70ae448290db6a8a86bdbc65fb99bf36ba64692c2679721ff
0x83be9c46b165ed2d820378bb916696785f5d1868f94c2ac5d4ce7f31babfa4e2243ad97166a9244a5e573a3739cf02b2
```

## Local usage
**01-amounts-for-pubkeys.ts** calculate CL rewards per pubkey and save the data into JSON

**02-fee-distributors-with-amounts-from-db.ts** fetch from DB and aggregate CL rewards per fee divider contract (the same values that will actually be used for rewards splitting) and save the data into JSON

**03-fee-distributors-with-legacy-already-split-amounts.ts** for the contract that were using earned CL rewards before instead of withdrawn, adjust the amount for correct calculations 

**04-balances.ts** fetch balances for client addresses, P2P address, and fee dividers addresses and save the data into JSON

**05-merkle-tree.ts** generate a Merkle tree with the CL rewards per fee divider contract data and save the data into JSON

**06-report-root-to-oracle-contract.ts** initiate a transaction to publish the Merkle root into the Oracle contract

**07-withdraw.ts** Do the actual splitting either via transactions or via ERC-4337 UserOperations.


## Important!
Each next script includes everything before it.

For example, if you need to do the actual splitting, there is no need to run all scripts, only the last one (**07-withdraw.ts**).
