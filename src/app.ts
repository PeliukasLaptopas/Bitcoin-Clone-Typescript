import Script from './script/script';
import Tx from './transaction/transaction';
import BufferReader from 'buffer-reader';
import TxOut from './transaction/txOut';
import TxIn from './transaction/txIn';
import { hash256 } from 'bitcoinjs-lib/src/crypto';

// Example transaction hex
const txHex: string = '0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000001976a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88acfeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac1943060001000000'

const transactionBuffer = Buffer.from(txHex, 'hex')

const transaction = Tx.parse(new BufferReader(transactionBuffer))
const serializedTransaction = transaction.serialize(false)
