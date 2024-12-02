import Script from './script/script';
import Tx from './transaction/transaction';
import BufferReader from 'buffer-reader';
import TxOut from './transaction/txOut';
import TxIn from './transaction/txIn';
import { writeTransactionsIntoCache } from "./readTransactionsToCache"
import TxFetcher from './transaction/transactionFetcher';
import { createHash } from 'crypto';

    // import * as bitcoin from 'bitcoinjs-lib';
    // bitcoin.Transaction.fromHex
(async () => {
    writeTransactionsIntoCache();
    
    const tx = await TxFetcher.fetchTransaction("452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03");
    // const sigHash = await tx.signatureHash(0)
    // console.log(sigHash.toString('hex'))

    const verifiedTx = await tx.verify(0)
    // console.log(verifiedTx)


    // console.log(tx.txIns[0].serialize().toString('hex'))

    //0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600
    // const data = "277f6acf172a2069dc9805ef547c153a6389abc95493333136be59b50904d422"
    // const b = Buffer.from(data, 'hex').reverse()
    // console.log(b.toString('hex'))

})();

/*
{
    "277f6acf172a2069dc9805ef547c153a6389abc95493333136be59b50904d422": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff00ffffffff0200e1f505000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00c2eb0b000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000",
    "391b840e9e1afea3f1687213162e8e2204a5d7190621addf7485bacffd489253": "010000000122d40409b559be3631339354c9ab89633a157c54ef0598dc69202a17cf6a7f270000000000ffffffff0100c2eb0b000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000",
    "1303295d79496d01e9ad51ee8f1eb0b41db9cc0df3ebabfbfd7177c832d0bf44": "010000000122d40409b559be3631339354c9ab89633a157c54ef0598dc69202a17cf6a7f270100000000ffffffff010050c300000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000",
    "452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03": "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600"
}

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff00ffffffff0200e1f505000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00c2eb0b000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000                                           

01000000                                            // Version
01                                                  // Input count
0000000000000000000000000000000000000000000000000000000000000000 // Coinbase TXID (none for first tx)
ffffffff                                            // Coinbase index
00                                                  // ScriptSig length (empty for coinbase)
ffffffff                                            // Sequence
02                                                  // Output count
00e1f50500000000                                    // Output 0: 0.1 BTC (10,000,000 sats)
19                                                  // ScriptPubKey length
76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac // ScriptPubKey (P2PKH for testing address)
00c2eb0b00000000                                    // Output 1: 0.05 BTC (5,000,000 sats)
19                                                  // ScriptPubKey length
76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac // ScriptPubKey (P2PKH for testing address)
00000000                                            // Locktime
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
0100000001901256ef3412cdab901256ef3412cdab901256ef3412cdab901256ef3412cdab0000000000ffffffff0100c2eb0b000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000                                          

01000000                                            // Version
01                                                  // Input count
901256ef3412cdab901256ef3412cdab901256ef3412cdab901256ef3412cdab // Previous transaction hash (little-endian)
00000000                                            // Output index 0 (spending 0.1 BTC from Transaction 1)
00                                                  // ScriptSig length (unsigned)
ffffffff                                            // Sequence
01                                                  // Output count
00c2eb0b00000000                                    // Output: 0.05 BTC (5,000,000 sats)
19                                                  // ScriptPubKey length
76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac // ScriptPubKey (P2PKH for testing address)
00000000                                            // Locktime
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
0100000001901256ef3412cdab901256ef3412cdab901256ef3412cdab901256ef3412cdab0100000000ffffffff010050c300000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000                                          

01000000                                            // Version
01                                                  // Input count
901256ef3412cdab901256ef3412cdab901256ef3412cdab901256ef3412cdab // Previous transaction hash (little-endian)
01000000                                            // Output index 1 (spending 0.05 BTC from Transaction 1)
00                                                  // ScriptSig length (unsigned)
ffffffff                                            // Sequence
01                                                  // Output count
0050c30000000000                                    // Output: 0.02 BTC (2,000,000 sats)
19                                                  // ScriptPubKey length
76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac // ScriptPubKey (P2PKH for testing address)
00000000                                            // Locktime
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/