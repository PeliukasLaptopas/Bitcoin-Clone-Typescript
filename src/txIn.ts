import BitcoinVarint from "./bitcoinVarint";
import BufferReader from 'buffer-reader';

export class Script {
  // Placeholder for the Script class (can be extended later)
  constructor() {}

  toString(): string {
    return "Script()"; // Placeholder representation
  }

  static parse(): Script {
    return new Script()
  }
}

export default class TxIn {
  prevTx: Uint8Array;
  prevIndex: number;
  scriptSig: Script;
  sequence: number;

  constructor(
    prevTx: Uint8Array,
    prevIndex: number,
    scriptSig: Script | null = null,
    sequence: number = 0xffffffff // Default sequence value
  ) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.scriptSig = scriptSig ? scriptSig : new Script();
    this.sequence = sequence;
  }

  repr(): string {
    return `${Buffer.from(this.prevTx).toString('hex')}:${this.prevIndex}`;
  }

  static parse(buffer: BufferReader): TxIn {
    const prevTx = new Uint8Array(buffer.nextBuffer(32));
    const prevIndex = buffer.nextUInt32LE()
    const scriptSig = new Script()
    const sequence = buffer.nextUInt32LE()

    return new TxIn(prevTx, prevIndex, scriptSig, sequence)
  }
}
