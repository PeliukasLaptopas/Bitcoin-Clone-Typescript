import BufferReader from "buffer-reader";
import txCache from "../txCache.json"
import Tx from "./transaction/transaction";
import TxFetcher from "./transaction/transactionFetcher";

export function writeTransactionsIntoCache() {
    for (const [txId, txHexStr] of Object.entries(txCache)) {
        const txHexBuffer = Buffer.from(txHexStr, 'hex')
        const hexBufferReader = new BufferReader(txHexBuffer)
        const tx = Tx.parse(hexBufferReader)

        TxFetcher.cache[txId] = tx
    }
}