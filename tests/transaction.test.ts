import { describe, it, expect, beforeAll } from 'vitest';
import TxFetcher, { writeTransactionsIntoCache } from '../src/transactionCache/transactionFetcher';
import Tx from '../src/transaction/transaction';
import BufferReader from 'buffer-reader';

describe('Tx', () => {
    const rawTx = Buffer.from(
        "0100000002137c53f0fb48f83666fcfd2fe9f12d13e94ee109c5aeabbfa32bb9e02538f4cb000000006a473044022" +
        "07e6009ad86367fc4b166bc80bf10cf1e78832a01e9bb491c6d126ee8aa436cb502200e29e6dd7708ed419cd5ba79" +
        "8981c960f0cc811b24e894bff072fea8074a7c4c012103bc9e7397f739c70f424aa7dcce9d2e521eb228b0ccba619" + 
        "cd6a0b9691da796a1ffffffff517472e77bc29ae59a914f55211f05024556812a2dd7d8df293265acd83301590100" + 
        "00006b483045022100f4bfdb0b3185c778cf28acbaf115376352f091ad9e27225e6f3f350b847579c702200d69177" + 
        "773cd2bb993a816a5ae08e77a6270cf46b33f8f79d45b0cd1244d9c4c0121031c0b0b95b522805ea9d0225b1946ec" +
        "aeb1727c0b36c7e34165769fd8ed860bf5ffffffff027a958802000000001976a914a802fc56c704ce87c42d7c92e" +
        "b75e7896bdc41ae88aca5515e00000000001976a914e82bd75c9c662c3f5700b33fec8a676b6e9391d588ac00000000",
        'hex'
    )

    beforeAll(() => {
        writeTransactionsIntoCache()
    });

    it('Tx.serialize should result in same raw hex used to parse that tx', () => {
        const tx = Tx.parse(new BufferReader(rawTx))
        const serializedTxBuffer = tx.serialize()

        expect(rawTx.equals(serializedTxBuffer)).toBe(true);
    });
    
    it('Tx.id should be successfully calculated', () => {
        const tx = Tx.parse(new BufferReader(rawTx))
        expect(tx.id().toString('hex')).toBe("d1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81");
    });
    
    it('Tx.signatureHash should be successfully calculated', async () => {
        const tx = await TxFetcher.fetchTransaction("452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03")
        const _1 = await tx.signatureHash(0)
        const _2 = await tx.signatureHash(0) //multiple signatureHash calls to make sure tx state isnt mutated
        const sigHash = await tx.signatureHash(0)

        expect(sigHash.toString('hex')).toBe("27e0c5994dec7824e56dec6b2fcb342eb7cdb0d0957c2fce9882f715e85d81a6");
    });
    
    it('Tx.verify() should verify transaction successfully', async () => {
        const txToVerify = await TxFetcher.fetchTransaction("452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03");
        const verifiedTx1 = await txToVerify.verify()
    
        expect(verifiedTx1).toBe(true);
    });
    
    it('Tx.fee() should calculate fee correctly', async () => {
        const tx = await TxFetcher.fetchTransaction("452c629d67e41baec3ac6f04fe744b4b9617f8f859c63b3002f8684e7a4fee03");
        const txFee = await tx.fee()
    
        expect(txFee).toBe(40000);
    });
});
