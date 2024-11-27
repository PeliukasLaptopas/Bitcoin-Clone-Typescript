import BufferReader from 'buffer-reader';
import BitcoinVarint from '../utils/bitcoinVarint';

export default class TxOut {
  amount: number;
  scriptPubKey: Buffer;

  constructor(amount: number, scriptPubKey: Buffer) {
    this.amount = amount;
    this.scriptPubKey = scriptPubKey;
  }

  toString(): string {
    return `${this.amount}:${this.scriptPubKey}`;
  }

  serialize(): Buffer {
    const amountInLittleEndian = BitcoinVarint.intToLittleEndian(this.amount, 8);
    const scriptPubKeyLength = BitcoinVarint.encodeVarint(this.scriptPubKey.length);

    return Buffer.concat([amountInLittleEndian, scriptPubKeyLength, this.scriptPubKey]);
  }

  static parse(buffer: BufferReader): TxOut {
    const amountBf = buffer.nextBuffer(8)
    const amount = BitcoinVarint.littleEndianToInt(new Uint8Array(amountBf))
    const scriptPubKeyLength = BitcoinVarint.readVarint(buffer);
    const len = Buffer.from(BitcoinVarint.encodeVarint(scriptPubKeyLength))
    const scriptPubKey = buffer.nextBuffer(scriptPubKeyLength);

    return new TxOut(amount, scriptPubKey)
  }
}
