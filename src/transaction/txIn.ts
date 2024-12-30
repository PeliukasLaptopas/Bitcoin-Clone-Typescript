import BufferReader from 'buffer-reader';
import ScriptP2PKH from '../script/scriptP2PKH';
import BitcoinVarint from '../utils/bitcoinVarint';
import TxFetcher from '../transactionCache/transactionFetcher';
import Tx from './transaction';

export default class TxIn {
  prevTx: Buffer;
  prevIndex: number;
  scriptSig: Buffer; //includes varint of length inside this buffer
  sequence: number;

  constructor(
    prevTx: Buffer,
    prevIndex: number,
    scriptSig: Buffer | null = null,
    sequence: number = 0xffffffff // Default sequence value
  ) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.scriptSig = scriptSig ? scriptSig : Buffer.from([]);
    this.sequence = sequence;
  }

  public getPrevTxBigEndian() {
    return this.prevTx
  }

  // Fetch the previous transaction
  async fetchTx(): Promise<Tx> {
    const txId = Buffer.from(this.prevTx.toReversed()).toString('hex'); // Convert the previous transaction hash to hex
    return await TxFetcher.fetchTransaction(txId); // Fetch the transaction using the TxFetcher
  }

  // Get the output value from the previous transaction
  async value(): Promise<number> {
    const tx = await this.fetchTx(); // Fetch the previous transaction
    return tx.txOuts[this.prevIndex].amount; // Return the amount from the corresponding output
  }

  serialize(): Buffer {
    const prevTxBuffer = Buffer.from(this.prevTx);
    const prevIndexBuffer = BitcoinVarint.intToLittleEndian(this.prevIndex, 4);
    const sequenceBuffer = BitcoinVarint.intToLittleEndian(this.sequence, 4);

    return Buffer.concat([prevTxBuffer, prevIndexBuffer, this.scriptSig, sequenceBuffer]);
  }

  static parse(buffer: BufferReader): TxIn {
    const prevTx = buffer.nextBuffer(32);
    const prevIndex = BitcoinVarint.littleEndianToInt(new Uint8Array(buffer.nextBuffer(4)))

    const scriptSigLength = BitcoinVarint.readVarint(buffer);
    const scriptSig = buffer.nextBuffer(scriptSigLength);
    const sequence = buffer.nextUInt32LE()

    return new TxIn(prevTx, prevIndex, Buffer.concat([BitcoinVarint.encodeVarint(scriptSigLength), scriptSig]), sequence)
  }
}
