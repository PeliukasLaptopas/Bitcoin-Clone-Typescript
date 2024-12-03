import axios from 'axios'; // To handle HTTP requests (like `requests.get` in Python)
import { Buffer } from 'buffer'; // To work with raw bytes
import Tx from '../transaction/transaction';
import BufferReader from 'buffer-reader';
import txCache from "../../transaction_cache.json"

export default class TxFetcher {
  static cache = new Map<string, Tx>();

  static async fetchTransaction(tx_id: string): Promise<Tx> {
    const tx = TxFetcher.cache.get(tx_id);
    if (!tx) {
      throw new Error(`Transaction ${tx_id} not found in cache.`);
    }
    return Promise.resolve(tx);
  }
}

export function writeTransactionsIntoCache() {
  for (const [txId, txHexStr] of Object.entries(txCache)) {
      const txHexBuffer = Buffer.from(txHexStr, 'hex')
      const hexBufferReader = new BufferReader(txHexBuffer)
      const tx = Tx.parse(hexBufferReader)

      TxFetcher.cache.set(txId, tx) 
  }
}