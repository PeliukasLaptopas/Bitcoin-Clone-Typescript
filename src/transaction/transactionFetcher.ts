// import axios from 'axios'; // To handle HTTP requests (like `requests.get` in Python)
// import { Tx } from './Tx'; // Assuming Tx is a class you already have
// import { Buffer } from 'buffer'; // To work with raw bytes

// class TxFetcher {
//   static cache: { [key: string]: Tx } = {};

//   // Method to get the appropriate URL based on testnet or mainnet
//   static getUrl(testnet: boolean = false): string {
//     if (testnet) {
//       return 'http://testnet.programmingbitcoin.com';
//     } else {
//       return 'http://mainnet.programmingbitcoin.com';
//     }
//   }

//   // Method to fetch a transaction by its tx_id
//   static async fetch(tx_id: string, testnet: boolean = false, fresh: boolean = false): Promise<Tx> {
//     if (fresh || !(tx_id in TxFetcher.cache)) {
//       const url = `${TxFetcher.getUrl(testnet)}/tx/${tx_id}.hex`;

//       try {
//         // Use axios to fetch the data from the URL
//         const response = await axios.get(url);
//         let raw: Buffer = Buffer.from(response.data.trim(), 'hex');

//         // If the 4th byte of the raw transaction is 0, modify the raw data
//         if (raw[4] === 0) {
//           raw = Buffer.concat([raw.slice(0, 4), raw.slice(6)]);
//         }

//         // Parse the transaction
//         let tx = Tx.parse(raw, testnet);

//         // Set locktime
//         tx.locktime = this.littleEndianToInt(raw.slice(-4));

//         // If the tx_id does not match, raise an error
//         if (tx.id() !== tx_id) {
//           throw new Error(`not the same id: ${tx.id()} vs ${tx_id}`);
//         }

//         // Cache the transaction and return
//         TxFetcher.cache[tx_id] = tx;
//         TxFetcher.cache[tx_id].testnet = testnet;
//         return TxFetcher.cache[tx_id];

//       } catch (error) {
//         throw new Error(`Unexpected response: ${error}`);
//       }
//     } else {
//       return TxFetcher.cache[tx_id];
//     }
//   }

//   // Helper method to convert a little-endian byte array into an integer
//   static littleEndianToInt(bytes: Buffer): number {
//     return bytes.readUInt32LE(0); // Using the Buffer method to read little-endian
//   }
// }
