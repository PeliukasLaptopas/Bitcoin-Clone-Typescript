export class Script {
  // Placeholder for the Script class (can be extended later)
  constructor() {}

  toString(): string {
    return "Script()"; // Placeholder representation
  }
}

export default class TxIn {
  prevTx: Uint8Array; // Previous transaction ID
  prevIndex: number; // Previous transaction output index
  scriptSig: Script; // Unlocking script
  sequence: number; // Sequence number

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
}
