import BufferReader from 'buffer-reader';
import Script from './script';
import BitcoinVarint from '../utils/bitcoinVarint';

export default class TxIn {
  prevTx: Uint8Array;
  prevIndex: number;
  scriptSig: Buffer;
  sequence: number;

  constructor(
    prevTx: Uint8Array,
    prevIndex: number,
    scriptSig: Buffer | null = null,
    sequence: number = 0xffffffff // Default sequence value
  ) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.scriptSig = scriptSig ? scriptSig : Buffer.from([]);
    this.sequence = sequence;
  }

  repr(): string {
    return `${Buffer.from(this.prevTx).toString('hex')}:${this.prevIndex}`;
  }

  static parse(buffer: BufferReader): TxIn {
    const prevTx = new Uint8Array(buffer.nextBuffer(32));
    const prevIndex = buffer.nextUInt32LE()

    const scriptSigLength = BitcoinVarint.readVarint(buffer);
    const scriptSig = buffer.nextBuffer(scriptSigLength);
  
    const sequence = buffer.nextUInt32LE()

    return new TxIn(prevTx, prevIndex, scriptSig, sequence)
  }
}
