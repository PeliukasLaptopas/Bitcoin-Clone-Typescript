import BitcoinVarint from "../utils/bitcoinVarint";
import TxIn from "./txIn";
import BufferReader from 'buffer-reader';
import TxOut from "./txOut";
import TxFetcher from "../transactionCache/transactionFetcher";
import * as crypto from 'crypto';
import * as bitcoin from 'bitcoinjs-lib';
import ScriptP2PKH from "../script/scriptP2PKH";
import _ from 'lodash';

export default class Tx {
  version: number;
  txIns: TxIn[];
  txOuts: TxOut[];
  locktime: number;

  constructor(version: number, txIns: TxIn[], txOuts: TxOut[], locktime: number) {
    this.version = version;
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.locktime = locktime;
  }

  public id(): Buffer {
    const serializedTx = this.serialize(false)
    const firstHash = crypto.createHash('sha256').update(serializedTx).digest();
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();
    // Reverse the resulting hash to get the TXID in big-endian format
    const txid = secondHash.reverse();

    return txid;
  }

  //verifies a specific input
  private async verifyInput(inputIndex: number): Promise<boolean> {
    const scriptSigRaw = this.txIns[inputIndex].scriptSig //raw because it contains length, for decompiling we will need to get rid of length
    const scriptSigBufferReader = new BufferReader(scriptSigRaw)
    BitcoinVarint.readVarint(scriptSigBufferReader) // does a side effect of removing
    const scriptSig = scriptSigBufferReader.restAll()

    //we now have hex of our ScriptSig and ScriptPubKey. We need to transform them into a structured format like this below.
    //bitcoin.script.decompile does just that, turns it into this:
    //[
    //  118,                          // OP_DUP
    //  169,                          // OP_HASH160
    //  <Buffer 89 ab cd ef ...>,     // pubKeyHash (20 bytes)
    //  136,                          // OP_EQUALVERIFY
    //  172                           // OP_CHECKSIG
    //]

    const scriptSigChunks = bitcoin.script.decompile(scriptSig);
    if (!scriptSigChunks || scriptSigChunks.length < 2) {
        console.error('Invalid scriptSig format');
        return false;
    }

    const prevTx = await TxFetcher.fetchTransaction(Buffer.from(this.txIns[inputIndex].prevTx.toReversed()).toString('hex')) //prevTx is stored in little-endian so we need to reverse to take real value
    const scriptPubKeyRaw = prevTx.txOuts[this.txIns[inputIndex].prevIndex].scriptPubKey //raw because it contains length, for decompiling we will need to get rid of length
    //before decompiling ScriptPubKey, we need to discard length for bitcoin.script to work, first bytes stores length
    const scriptPubKeyBufferReader = new BufferReader(scriptPubKeyRaw)
    const scriptPubKeyLength = BitcoinVarint.readVarint(scriptPubKeyBufferReader) // does a side effect of removing
    const scriptPubKey = scriptPubKeyBufferReader.restAll()

    const scriptPubKeyChunks = bitcoin.script.decompile(scriptPubKey);
    if (!scriptPubKeyChunks || scriptPubKeyChunks.length < 2) {
        console.error('Invalid scriptPubKey format');
        return false;
    }

    const sigHash = await this.signatureHash(inputIndex)
    const combinedScript = scriptSigChunks.concat(scriptPubKeyChunks);

    const script = new ScriptP2PKH(combinedScript)
    const valid = script.evaluateP2PKH(sigHash)

    return valid;
  }

  public async verify(): Promise<Boolean> {
    const fee = await this.fee()

    if(fee < 0) {
      return false
    }

    this.txIns.forEach(async (_, idx ) => {
        const verified = await this.verifyInput(idx)
        if(!verified) {
          return false
        }
      }
    )

    return true
  }

  //The hash of the transaction data that is being signed by the private key (this is specifically constructed for signing).
  //It is a modified hash of the transaction that includes specific rules for signing (e.g., the scriptPubKey and the SIGHASH flag).
  public async signatureHash(inputIndex: number): Promise<Buffer> {
    const clonedTx: Tx = _.cloneDeep(this)

    await Promise.all(clonedTx.txIns.map(async (txIn: TxIn, index) => {
      if (inputIndex !== index) {
        txIn.scriptSig = Buffer.alloc(0)
      } else {
        const prevTx = await TxFetcher.fetchTransaction(Buffer.from(txIn.prevTx.toReversed()).toString('hex')) //prevTx is stored in little-endian so we need to reverse to take real value
        const scriptPubKey = prevTx.txOuts[txIn.prevIndex].scriptPubKey
        txIn.scriptSig = scriptPubKey
      }
    }))
    
    const versionEncoded = BitcoinVarint.intToLittleEndian(clonedTx.version, 4);
    const txInsLengthEncoded = BitcoinVarint.encodeVarint(clonedTx.txIns.length)
    const txOutsLengthEncoded = BitcoinVarint.encodeVarint(clonedTx.txOuts.length)
    const lockTimeEncoded = BitcoinVarint.intToLittleEndian(clonedTx.locktime, 4)
    const txInsSerialized = clonedTx.txIns.map(txIn => txIn.serialize())
    const txOutsSerialized = clonedTx.txOuts.map(txOut => txOut.serialize())
    const SIGHASH_ALL = Buffer.from([0x01, 0x00, 0x00, 0x00]) //encoded in little endian over 4 bytes
    const serializedTx = Buffer.concat([versionEncoded, txInsLengthEncoded, ...txInsSerialized, txOutsLengthEncoded, ...txOutsSerialized, lockTimeEncoded, SIGHASH_ALL])
    
    const firstHash = crypto.createHash('sha256').update(serializedTx).digest();
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();

    return secondHash;
  }

  async fee(): Promise<number> {
    const inputSum  = (await Promise.all(this.txIns.map(txIn => txIn.value()))).reduce((acc, value) => acc + value, 0);
    const outputSum = (await Promise.all(this.txOuts.map(txOut => txOut.amount))).reduce((acc, value) => acc + value, 0);
    
    return inputSum - outputSum
  }

  //appendSigHashAll - last 4 bytes, this is to specify what the signature is authorizing
  public serialize(appendSigHashAll: boolean = false): Buffer {
    const versionEncoded = BitcoinVarint.intToLittleEndian(this.version, 4);
    const txInsLengthEncoded = BitcoinVarint.encodeVarint(this.txIns.length)
    const txOutsLengthEncoded = BitcoinVarint.encodeVarint(this.txOuts.length)
    const lockTimeEncoded = BitcoinVarint.intToLittleEndian(this.locktime, 4)
    const txInsSerialized = this.txIns.map(tx => tx.serialize())
    const txOutsSerialized = this.txOuts.map(tx => tx.serialize())
    const serializedTx = Buffer.concat([versionEncoded, txInsLengthEncoded, ...txInsSerialized, txOutsLengthEncoded, ...txOutsSerialized, lockTimeEncoded])
    const SIGHASH_ALL = Buffer.from([0x01, 0x00, 0x00, 0x00]) //encoded in little endian over 4 bytes
    
    if(appendSigHashAll) 
      return Buffer.concat([serializedTx, SIGHASH_ALL])
    else
      return serializedTx
  }

  static parse(buffer: BufferReader): Tx {
    const versionBuffer = buffer.nextBuffer(4)
    const version = BitcoinVarint.littleEndianToInt(new Uint8Array(versionBuffer))

    const txInputsCount = BitcoinVarint.readVarint(buffer)
    const txInputsCountEncoded = BitcoinVarint.encodeVarint(txInputsCount)

    const txInputs: TxIn[] = [];
    for (let i = 0; i < txInputsCount; i++) {
      const txIn = TxIn.parse(buffer);
      txInputs.push(txIn);
    }

    const txOutputsCount = BitcoinVarint.readVarint(buffer)
    const txOutputs: TxOut[] = [];
    for (let i = 0; i < txOutputsCount; i++) {
      const txOut = TxOut.parse(buffer);
      txOutputs.push(txOut);
    }
    
    const locktime = BitcoinVarint.littleEndianToInt(new Uint8Array(buffer.nextBuffer(4)))

    return new Tx(version, txInputs, txOutputs, locktime);
  }
}
