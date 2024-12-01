import axios from 'axios'; // To handle HTTP requests (like `requests.get` in Python)
import { Buffer } from 'buffer'; // To work with raw bytes
import Tx from './transaction';
import BufferReader from 'buffer-reader';

export default class TxFetcher {
  // static cache: { [key: string]: Tx } = {};
  static cache = new Map<string, Tx>();

  static async fetchTransaction(tx_id: string): Promise<Tx> {
    const tx = TxFetcher.cache.get(tx_id);
    if (!tx) {
      throw new Error(`Transaction ${tx_id} not found in cache.`);
    }
    return Promise.resolve(tx);
  }
}
