import { describe, it, expect, beforeAll } from 'vitest';
import TxFetcher, { writeTransactionsIntoCache } from '../src/transactionCache/transactionFetcher';
import Tx from '../src/transaction/transaction';
import BufferReader from 'buffer-reader';
import * as crypto from 'crypto';
import * as bitcoin from 'bitcoinjs-lib';
import ScriptP2PKH from '../src/script/scriptP2PKH';

describe('Script', () => {
    beforeAll(() => {
        writeTransactionsIntoCache()
    });

    //test based on these 2 transactions:
    //"d1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81": "0100000002137c53f0fb48f83666fcfd2fe9f12d13e94ee109c5aeabbfa32bb9e02538f4cb000000006a47304402207e6009ad86367fc4b166bc80bf10cf1e78832a01e9bb491c6d126ee8aa436cb502200e29e6dd7708ed419cd5ba798981c960f0cc811b24e894bff072fea8074a7c4c012103bc9e7397f739c70f424aa7dcce9d2e521eb228b0ccba619cd6a0b9691da796a1ffffffff517472e77bc29ae59a914f55211f05024556812a2dd7d8df293265acd8330159010000006b483045022100f4bfdb0b3185c778cf28acbaf115376352f091ad9e27225e6f3f350b847579c702200d69177773cd2bb993a816a5ae08e77a6270cf46b33f8f79d45b0cd1244d9c4c0121031c0b0b95b522805ea9d0225b1946ecaeb1727c0b36c7e34165769fd8ed860bf5ffffffff027a958802000000001976a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88aca5515e00000000001976a914e82bd75c9c662c3f5700b33fec8a676b6e9391d588ac00000000",
    //"452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03": "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600",
    it('Script evaluation on P2PKH should return true on valid script', async () => {
        const txToVerify = await TxFetcher.fetchTransaction("452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03");

        const scriptSigRaw = Buffer.from(
            "483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278a",
            'hex'
        )
        const scriptPubKeyRaw = Buffer.from(
            "76a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88ac",
            'hex'
        )

        const scriptPubKeyChunks = bitcoin.script.decompile(scriptPubKeyRaw);
        if (!scriptPubKeyChunks || scriptPubKeyChunks.length < 2) {
            throw Error("Failed to generate script pub key chunks")
        }
        
        const scriptSigChunks = bitcoin.script.decompile(scriptSigRaw);
        if (!scriptSigChunks || scriptSigChunks.length < 2) {
            throw Error("Failed to generate script pub key chunks")
        }

        
        // const sigHash = await this.signatureHash(inputIndex)
        const combinedScript = scriptSigChunks.concat(scriptPubKeyChunks);

        const sigHash = await txToVerify.signatureHash(0)
        const script = new ScriptP2PKH(combinedScript)
        const valid = script.evaluateP2PKH(sigHash)

        expect(valid).toBe(true)
    });
});
