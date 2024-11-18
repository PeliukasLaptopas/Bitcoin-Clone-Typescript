import BitcoinVarint from "./bitcoinVarint";
import TxIn from "./txIn";

class Tx {
  version: number;
  txIns: TxIn[]; // Array of transaction inputs
  // txOuts: TxOut[]; // Array of transaction outputs
  // locktime: number;
  // testnet: boolean;

  constructor(version: number, txIns: TxIn[]/*, txOuts: TxOut[], locktime: number, testnet: boolean = false*/) {
    this.version = version;
    this.txIns = txIns;
    // this.txOuts = txOuts;
    // this.locktime = locktime;
    // this.testnet = testnet;
  }

  // repr(): string {
    // let txInsRepr = this.txIns.map(txIn.ts => txIn.ts.repr()).join('\n');
    // let txOutsRepr = this.txOuts.map(txOut => txOut.repr()).join('\n');
    //
    // return `tx: ${this.id()} version: ${this.version} tx_ins: ${txInsRepr} tx_outs: ${txOutsRepr} locktime: ${this.locktime}`;
  // }

  // id(): string {
    // Returns the human-readable hexadecimal transaction hash
    // return this.hash().toString('hex'); // Replace with a hex string conversion method
  // }

  // hash(): Buffer {
  //   // Returns the binary hash of the serialized transaction
  //   return this.hash256(this.serialize()).reverse(); // Reverse for little-endian order
  // }

  // Helper method for double SHA256 hashing
  // hash256(data: Buffer): Buffer {
  //   const crypto = require('crypto');
  //   return crypto.createHash('sha256').update(
  //     crypto.createHash('sha256').update(data).digest()
  //   ).digest();
  // }

  // serialize(): Buffer {
  //   // Serialize the transaction (not implemented, placeholder)
  //   return Buffer.alloc(0); // Replace with actual serialization logic
  // }

  static parse(serialization: Uint8Array): Tx {
    // Extract the first 4 bytes for the version (little-endian)
    const versionBytes = serialization.slice(0, 4);

    // Convert the little-endian bytes to an integer
    const version = BitcoinVarint.littleEndianToInt(versionBytes);

    // Create and return a Tx instance
    return new Tx(version);
  }
}

// Supporting interfaces/classes
