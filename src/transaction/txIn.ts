import BufferReader from 'buffer-reader';
import Script from './script';
import BitcoinVarint from '../utils/bitcoinVarint';

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
