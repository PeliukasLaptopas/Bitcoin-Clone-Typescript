import BitcoinVarint from "../utils/bitcoinVarint";
import TxIn from "./txIn";
import BufferReader from 'buffer-reader';
import TxOut from "./txOut";
import TxFetcher from "./transactionFetcher";
import * as crypto from 'crypto';

export default class Tx {
  version: number;
  txIns: TxIn[];
  txOuts: TxOut[];
  locktime: number;
  testnet: boolean;

  constructor(version: number, txIns: TxIn[], txOuts: TxOut[], locktime: number, testnet: boolean = false) {
    this.version = version;
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.locktime = locktime;
    this.testnet = testnet;
  }

  hash(): Buffer {
    return Buffer.from([]);
  }

  public id(): Buffer {
    const serializedTx = this.serialize(false)
    const firstHash = crypto.createHash('sha256').update(serializedTx).digest();
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();
    // Reverse the resulting hash to get the TXID in big-endian format
    const txid = secondHash.reverse();

    return txid;
  }

  public test() {
    return 123
  }

  //The hash of the transaction data that is being signed by the private key (this is specifically constructed for signing).
  //It is a modified hash of the transaction that includes specific rules for signing (e.g., the scriptPubKey and the SIGHASH flag).
  public signatureHash(inputIndex: number): Buffer {
    const clonedTxIn: Tx = Object.assign(
      Object.create(Object.getPrototypeOf(this)), 
      this
    );

    // clonedTxIn.txIns.map((txIn: TxIn, index) => {
    //   if (inputIndex !== index) {
    //     txIn.scriptSig = Buffer.alloc(0)
    //   } else {
    //     const prevTx = TxFetcher.fetchTransaction(txIn.prevIndex)
    //   }
    // })

    // Reverse the prevTx (because it's stored in little-endian format)
    // In Bitcoin transactions, the txid of a previous transaction input is stored in little-endian byte order in the raw hex.
    // However, when displayed, it is usually presented in big-endian format for human readability.
    // const previousTransactionHash

    return Buffer.from([])
  }

  async fee(testnet: boolean): Promise<number> {
    const inputSum  = (await Promise.all(this.txIns.map(tx => tx.value(testnet)))).reduce((acc, value) => acc + value, 0);
    const outputSum = (await Promise.all(this.txOuts.map(tx => tx.amount))).reduce((acc, value) => acc + value, 0);
    
    return inputSum - outputSum
  }

  //appendSigHashAll - last 4 bytes, this is to specify what the signature is authorizing
  public serialize(appendSigHashAll: boolean): Buffer {
    const versionEncoded = BitcoinVarint.intToLittleEndian(this.version, 4);
    const txInsLengthEncoded = BitcoinVarint.encodeVarint(this.txIns.length)
    const txOutsLengthEncoded = BitcoinVarint.encodeVarint(this.txOuts.length)
    const lockTimeEncoded = BitcoinVarint.intToLittleEndian(this.locktime, 4)
    const txInsSerialized = this.txIns.map(tx => tx.serialize())
    const txOutsSerialized = this.txOuts.map(tx => tx.serialize())
    const serializedTx = Buffer.concat([versionEncoded, txInsLengthEncoded, ...txInsSerialized, txOutsLengthEncoded, ...txOutsSerialized, lockTimeEncoded])
    const SIGHASH_ALL = Buffer.from([0x01, 0x00, 0x00, 0x00]) //encoded in little endian over 4 bytes
    
    if(appendSigHashAll) 
      return Buffer.concat([serializedTx, SIGHASH_ALL])
    else
      return serializedTx
  }

  static parse(buffer: BufferReader, testnet: boolean = false): Tx {
    const versionBuffer = buffer.nextBuffer(4)
    const version = BitcoinVarint.littleEndianToInt(new Uint8Array(versionBuffer))

    const txInputsCount = BitcoinVarint.readVarint(buffer)
    const txInputsCountEncoded = BitcoinVarint.encodeVarint(txInputsCount)

    const txInputs: TxIn[] = [];
    for (let i = 0; i < txInputsCount; i++) {
      const txIn = TxIn.parse(buffer);
      txInputs.push(txIn);
    }

    const txOutputsCount = BitcoinVarint.readVarint(buffer)
    const txOutputs: TxOut[] = [];
    for (let i = 0; i < txOutputsCount; i++) {
      const txOut = TxOut.parse(buffer);
      txOutputs.push(txOut);
    }
    
    const locktime = BitcoinVarint.littleEndianToInt(new Uint8Array(buffer.nextBuffer(4)))

    return new Tx(version, txInputs, txOutputs, locktime, testnet);
  }
}
