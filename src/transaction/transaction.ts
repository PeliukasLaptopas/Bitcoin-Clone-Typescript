import BitcoinVarint from "../utils/bitcoinVarint";
import TxIn from "./txIn";
import BufferReader from 'buffer-reader';
import TxOut from "./txOut";
import TxFetcher from "./transactionFetcher";
import * as crypto from 'crypto';

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

  hash(): Buffer {
    return Buffer.from([]);
  }

  public id(): Buffer {
    const serializedTx = this.serialize(false)
    const firstHash = crypto.createHash('sha256').update(serializedTx).digest();
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();
    // Reverse the resulting hash to get the TXID in big-endian format
    const txid = secondHash.reverse();

    return txid;
  }

  //The hash of the transaction data that is being signed by the private key (this is specifically constructed for signing).
  //It is a modified hash of the transaction that includes specific rules for signing (e.g., the scriptPubKey and the SIGHASH flag).
  public async signatureHash(inputIndex: number): Promise<Buffer> {
    const clonedTx: Tx = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );

    clonedTx.txIns.map(async (txIn: TxIn, index) => {
      if (inputIndex !== index) {
        txIn.scriptSig = Buffer.alloc(0)
      } else {
        const prevTx = await TxFetcher.fetchTransaction(Buffer.from(txIn.prevTx.toReversed()).toString('hex')) //prevTx is stored in little-endian so we need to reverse to take real value
        const scriptPubKey = prevTx.txOuts[txIn.prevIndex].scriptPubKey
        txIn.scriptSig = scriptPubKey
      }
    })
    //mine:      34b92a2c5acec6f93173370ca387aace9de76a5676f999e7245e66edbfdf00f0
    //should be: 27e0c5994dec7824e56dec6b2fcb342eb7cdb0d0957c2fce9882f715e85d81a6
    
    const versionEncoded = BitcoinVarint.intToLittleEndian(clonedTx.version, 4);
    const txInsLengthEncoded = BitcoinVarint.encodeVarint(clonedTx.txIns.length)
    const txOutsLengthEncoded = BitcoinVarint.encodeVarint(clonedTx.txOuts.length)
    const lockTimeEncoded = BitcoinVarint.intToLittleEndian(clonedTx.locktime, 4)
    const txInsSerialized = clonedTx.txIns.map(tx => tx.serialize())
    const txOutsSerialized = clonedTx.txOuts.map(tx => tx.serialize())
    const SIGHASH_ALL = Buffer.from([0x01, 0x00, 0x00, 0x00]) //encoded in little endian over 4 bytes
    const serializedTx = Buffer.concat([versionEncoded, txInsLengthEncoded, ...txInsSerialized, txOutsLengthEncoded, ...txOutsSerialized, lockTimeEncoded, SIGHASH_ALL])
    
    const firstHash = crypto.createHash('sha256').update(serializedTx).digest();
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();

    console.log(Buffer.concat(txInsSerialized).toString('hex'))
    console.log(this.txIns[0].serialize().toString('hex'))

    // sb: 0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000001976a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88acfeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac1943060001000000
    // is: 0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac1943060001000000
    
    return secondHash;
  }

  async fee(): Promise<number> {
    const inputSum  = (await Promise.all(this.txIns.map(tx => tx.value()))).reduce((acc, value) => acc + value, 0);
    const outputSum = (await Promise.all(this.txOuts.map(tx => tx.amount))).reduce((acc, value) => acc + value, 0);
    
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


/*
010000000100000000000000000000000000000000000000000000000000000000000000000000006b4830450221009af6687ea6d
                                                                          0000006b
01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff



x Version:               01000000          (Version number: 1, little-endian)
x Input Count:           01                (1 input in this transaction)
x Input (Previous TXID): 0000000000000000000000000000000000000000000000000000000000000000
  Input (Output Index):  00000000          (Output index in the previous transaction: 0)
                         
  Script Length:         6b                (Length of scriptSig: 107 bytes)
  ScriptSig:             4830450221009af6687ea6dc495adfed761c1f78ac30f97879a3ecea704d62cf0e9e1ee99c990220633f9e0dedce631020b343df922cbae0258969135bf5eb8f8757e41eafb683dd01210395581e52c354cd2f484fe8ed83af7a3097005b2f9c60bff71d35bd795f54b67
  Sequence:              ffffffff          (Sequence number: 0xFFFFFFFF)
  Output Count:          01                (1 output in this transaction)
  Output Value:          00e1f50500000000  (Value in satoshis: 1,000,000 satoshis or 0.01 BTC)
  Script Length:         19                (Length of scriptPubKey: 25 bytes)
  ScriptPubKey:          76a9141d0f172a0ecb48aee1be1f2687d2963ae33f71a188ac
  Locktime:              00000000          (Transaction is valid immediately)
*/