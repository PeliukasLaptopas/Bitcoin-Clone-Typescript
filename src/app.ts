import Script from './script/script';
import Tx from './transaction/transaction';
import BufferReader from 'buffer-reader';
import TxOut from './transaction/txOut';
import TxIn from './transaction/txIn';
import { hash256 } from 'bitcoinjs-lib/src/crypto';
import { writeTransactionsIntoCache } from "./readTransactionsToCache"
import TxFetcher from './transaction/transactionFetcher';

writeTransactionsIntoCache()

// const firstTx = TxFetcher.fetchTransaction("0d6fe5213c0b3291f208cba8bfb59b7476dffacc4e5cb66f6eb20a080843a299")

// // Example transaction hex
// const txHex: string = '0200000000010140d43a99926d43eb0e619bf0b3d83b4a31f60c176beecfb9d35bf45e54d0f7420100000017160014a4b4ca48de0b3fffc15404a1acdc8dbaae226955ffffffff0100e1f5050000000017a9144a1154d50b03292b3024370901711946cb7cccc387024830450221008604ef8f6d8afa892dee0f31259b6ce02dd70c545cfcfed8148179971876c54a022076d771d6e91bed212783c9b06e0de600fab2d518fad6f15a2b191d7fbd262a3e0121039d25ab79f41f75ceaf882411fd41fa670a4c672c23ffaf0e361a969cde0692e800000000'

// const transactionBuffer = Buffer.from(txHex, 'hex')
// const transaction = Tx.parse(new BufferReader(transactionBuffer))

// const serializedTransaction = transaction.serialize(false)
// console.log(transaction.id().toString('hex'))
// console.log(transaction.signatureHash(0))
