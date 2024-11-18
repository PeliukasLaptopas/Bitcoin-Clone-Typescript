import BitcoinVarint from "../utils/bitcoinVarint";
import TxIn from "./txIn";
import BufferReader from 'buffer-reader';
import TxOut from "./txOut";

export default class Tx {
  version: number;
  txIns: TxIn[]; // Array of transaction inputs
  txOuts: TxOut[]; // Array of transaction outputs
  locktime: number;
  // testnet: boolean;

  constructor(version: number, txIns: TxIn[], txOuts: TxOut[], locktime: number/*, testnet: boolean = false*/) {
    this.version = version;
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.locktime = locktime;
    // this.testnet = testnet;
  }

  // repr(): string {
    // let txInsRepr = this.txIns.map(txIn.ts => txIn.ts.repr()).join('\n');
    // let txOutsRepr = this.txOuts.map(txOut => txOut.repr()).join('\n');
    //
    // return `tx: ${this.id()} version: ${this.version} tx_ins: ${txInsRepr} tx_outs: ${txOutsRepr} locktime: ${this.locktime}`;
  // }

  // id(): string {
    // Returns the human-readable hexadecimal transaction hash
    // return this.hash().toString('hex'); // Replace with a hex string conversion method
  // }

  // hash(): Buffer {
  //   // Returns the binary hash of the serialized transaction
  //   return this.hash256(this.serialize()).reverse(); // Reverse for little-endian order
  // }

  // Helper method for double SHA256 hashing
  // hash256(data: Buffer): Buffer {
  //   const crypto = require('crypto');
  //   return crypto.createHash('sha256').update(
  //     crypto.createHash('sha256').update(data).digest()
  //   ).digest();
  // }

  serialize(): Buffer {
    const versionEncoded = BitcoinVarint.intToLittleEndian(this.version, 4);
    const txInsLengthEncoded = BitcoinVarint.encodeVarint(this.txIns.length)
    const txOutsLengthEncoded = BitcoinVarint.encodeVarint(this.txOuts.length)
    const lockTimeEncoded = BitcoinVarint.intToLittleEndian(this.locktime, 4)

    const txInsSerialized = this.txIns.map(tx => tx.serialize())
    const txOutsSerialized = this.txOuts.map(tx => tx.serialize())
    
    return Buffer.concat([versionEncoded, txInsLengthEncoded, ...txInsSerialized, txOutsLengthEncoded, ...txOutsSerialized, lockTimeEncoded])
  }

  static parse(buffer: BufferReader): Tx {
    const version = BitcoinVarint.littleEndianToInt(new Uint8Array(buffer.nextBuffer(4)))

    const txInputsCount = BitcoinVarint.readVarint(buffer)

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

    return new Tx(version, txInputs, txOutputs, locktime);
  }
}
