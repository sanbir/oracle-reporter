# oracle-reporter

**01-amounts-for-pubkeys.ts** calculate CL rewards per pubkey and save the data into JSON

**02-fee-distributors-with-amounts.ts** aggregate CL rewards per fee divider contract (the same values that will actually be used for rewards splitting) and save the data into JSON

**03-merkle-tree.ts** generate a Merkle tree with the CL rewards per fee divider contract data and save the data into JSON

**04-report-root-to-oracle-contract.ts** initiate a transaction to publish the Merkle root into the Oracle contract

**05-withdraw.ts** Do the actual splitting either via transactions or via ERC-4337 UserOperations.


## Important!
Each next script includes everything before it.

For example, if you need to do the actual splitting, there is no need to run 5 scripts, only the last one (**05-withdraw.ts**).
