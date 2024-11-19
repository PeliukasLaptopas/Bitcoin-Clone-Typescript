import BufferReader from 'buffer-reader';
import Script from '../script/script';
import BitcoinVarint from '../utils/bitcoinVarint';
import TxFetcher from './transactionFetcher';
import Tx from './transaction';

export default class TxIn {
  prevTx: Buffer;
  prevIndex: number;
  scriptSig: Buffer;
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

  // Fetch the previous transaction
  async fetchTx(testnet: boolean = false): Promise<Tx> {
    const txId = this.prevTx.toString('hex'); // Convert the previous transaction hash to hex
    return await TxFetcher.fetchTransaction(txId, testnet); // Fetch the transaction using the TxFetcher
  }

  // Get the output value from the previous transaction
  async value(testnet: boolean = false): Promise<number> {
    const tx = await this.fetchTx(testnet); // Fetch the previous transaction
    return tx.txOuts[this.prevIndex].amount; // Return the amount from the corresponding output
  }

  // Get the ScriptPubKey from the previous transaction
  async scriptPubKey(testnet: boolean = false): Promise<Buffer> {
    const tx = await this.fetchTx(testnet); // Fetch the previous transaction
    return tx.txOuts[this.prevIndex].scriptPubKey; // Return the ScriptPubKey from the corresponding output
  }

  serialize(): Buffer {
    // Reverse the prevTx (because it's stored in little-endian format)
    const prevTxBuffer = Buffer.from(this.prevTx).reverse();
    const prevIndexBuffer = BitcoinVarint.intToLittleEndian(this.prevIndex, 4);
    const sequenceBuffer = BitcoinVarint.intToLittleEndian(this.sequence, 4);
    return Buffer.concat([prevTxBuffer, prevIndexBuffer, this.scriptSig, sequenceBuffer]);
  }

  static parse(buffer: BufferReader): TxIn {
    const prevTx = buffer.nextBuffer(32);
    const prevIndex = buffer.nextUInt32LE()

    const scriptSigLength = BitcoinVarint.readVarint(buffer);
    const scriptSig = buffer.nextBuffer(scriptSigLength);
  
    const sequence = buffer.nextUInt32LE()

    return new TxIn(prevTx, prevIndex, scriptSig, sequence)
  }
}
