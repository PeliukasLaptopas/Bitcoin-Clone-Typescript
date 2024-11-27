import axios from 'axios'; // To handle HTTP requests (like `requests.get` in Python)
import { Buffer } from 'buffer'; // To work with raw bytes
import Tx from './transaction';
import BufferReader from 'buffer-reader';

export default class TxFetcher {
  static cache: { [key: string]: Tx } = {};

  static async fetchTransaction(tx_id: string): Promise<Tx> {
    return TxFetcher.cache[tx_id];
  }
}
