import BitcoinVarint from "../utils/bitcoinVarint";
import TxIn from "./txIn";
import BufferReader from 'buffer-reader';
import TxOut from "./txOut";

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

  id(): string {
    return this.hash().toString('hex');
  }

  async fee(testnet: boolean): Promise<number> {
    const inputSum  = (await Promise.all(this.txIns.map(tx => tx.value(testnet)))).reduce((acc, value) => acc + value, 0);
    const outputSum = (await Promise.all(this.txOuts.map(tx => tx.amount))).reduce((acc, value) => acc + value, 0);
    
    return inputSum - outputSum
  }

  serialize(): Buffer {
    const versionEncoded = BitcoinVarint.intToLittleEndian(this.version, 4);
    const txInsLengthEncoded = BitcoinVarint.encodeVarint(this.txIns.length)
    const txOutsLengthEncoded = BitcoinVarint.encodeVarint(this.txOuts.length)
    const lockTimeEncoded = BitcoinVarint.intToLittleEndian(this.locktime, 4)

    const txInsSerialized = this.txIns.map(tx => tx.serialize())
    const txOutsSerialized = this.txOuts.map(tx => tx.serialize())
    
    return Buffer.concat([versionEncoded, txInsLengthEncoded, ...txInsSerialized, txOutsLengthEncoded, ...txOutsSerialized, lockTimeEncoded])
  }

  static parse(buffer: BufferReader, testnet: boolean): Tx {
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

    return new Tx(version, txInputs, txOutputs, locktime, testnet);
  }
}
