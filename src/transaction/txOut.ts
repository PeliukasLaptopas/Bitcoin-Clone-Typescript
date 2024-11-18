import BufferReader from 'buffer-reader';
import BitcoinVarint from '../utils/bitcoinVarint';
import Script from './script';

export default class TxOut {
  amount: number;
  scriptPubKey: string;

  constructor(amount: number, scriptPubKey: string) {
    this.amount = amount;
    this.scriptPubKey = scriptPubKey;
  }

  toString(): string {
    return `${this.amount}:${this.scriptPubKey}`;
  }

  static parse(buffer: BufferReader): TxOut {
    const amount = BitcoinVarint.littleEndianToInt(new Uint8Array(buffer.nextBuffer(8)))
    // const scriptPubKeyLength = BitcoinVarint.readVarint(buffer)
    const scriptPubKey = Script.parse()

    return new TxOut(amount, "")
  }
}
