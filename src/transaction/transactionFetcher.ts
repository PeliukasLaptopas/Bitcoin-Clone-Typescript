import axios from 'axios'; // To handle HTTP requests (like `requests.get` in Python)
import { Buffer } from 'buffer'; // To work with raw bytes
import Tx from './transaction';
import BufferReader from 'buffer-reader';

export default class TxFetcher {
  static cache: { [key: string]: Tx } = {};

  static getUrl(testnet: boolean = false): string {
    if (testnet) {
      return 'http://testnet.programmingbitcoin.com';
    } else {
      return 'http://mainnet.programmingbitcoin.com';
    }
  }

  static async fetchTransaction(tx_id: string, testnet: boolean = false, fresh: boolean = false): Promise<Tx> {
    if (fresh || !(tx_id in TxFetcher.cache)) {
      const url = `${TxFetcher.getUrl(testnet)}/tx/${tx_id}.hex`;

      try {
        const response = await axios.get(url);
        const raw: Buffer = Buffer.from(response.data.trim(), 'hex');

        // If the 4th byte of the raw transaction is 0, create a new buffer
        const modifiedRaw: Buffer = raw[4] === 0 
          ? Buffer.concat([raw.subarray(0, 4), raw.slice(6)]) 
          : raw;
        const rawBufferReader = new BufferReader(modifiedRaw);

        let tx = Tx.parse(rawBufferReader, testnet);

        tx.locktime = this.littleEndianToInt(raw.subarray(-4));

        // If the tx_id does not match, raise an error
        if (tx.id().toString() !== tx_id) {
          throw new Error(`not the same id: ${tx.id()} vs ${tx_id}`);
        }

        // Cache the transaction and return
        TxFetcher.cache[tx_id] = tx;
        TxFetcher.cache[tx_id].testnet = testnet;
        return TxFetcher.cache[tx_id];

      } catch (error) {
        throw new Error(`Unexpected response: ${error}`);
      }
    } else {
      return TxFetcher.cache[tx_id];
    }
  }

  // Helper method to convert a little-endian byte array into an integer
  static littleEndianToInt(bytes: Buffer): number {
    return bytes.readUInt32LE(0); // Using the Buffer method to read little-endian
  }
}
