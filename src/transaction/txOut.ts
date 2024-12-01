import BufferReader from 'buffer-reader';
import BitcoinVarint from '../utils/bitcoinVarint';

export default class TxOut {
  amount: number;
  scriptPubKey: Buffer; //includes varint of length inside this buffer

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

    return Buffer.concat([amountInLittleEndian, this.scriptPubKey]);
  }

  static parse(buffer: BufferReader): TxOut {
    const amountBf = buffer.nextBuffer(8)
    const amount = BitcoinVarint.littleEndianToInt(new Uint8Array(amountBf))
    const scriptPubKeyLength = BitcoinVarint.readVarint(buffer);
    const scriptPubKey = buffer.nextBuffer(scriptPubKeyLength);

    return new TxOut(amount, Buffer.concat([BitcoinVarint.encodeVarint(scriptPubKeyLength), scriptPubKey]))
  }
}
