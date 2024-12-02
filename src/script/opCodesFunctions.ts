import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { OpCode } from './opCodes';

const ECPair = ECPairFactory(ecc);
    
export function opDup(stack: Buffer[]): boolean {
    if (stack.length < 1) {
        return false;
    }
    stack.push(stack[stack.length - 1]);
    return true;
}

// Helper functions
const hash160 = (buffer: Buffer): Buffer => {
    return bitcoin.crypto.hash160(buffer);
};

const hash256 = (buffer: Buffer): Buffer => {
    return bitcoin.crypto.hash256(buffer);
};

const encodeNum = (num: number): Buffer => {
    // Encode the number into a single byte (assuming the number is 1 or 0 for simplicity)
    return Buffer.from([num]);
};

const opHash160 = (stack: Buffer[]): boolean => {
    if (stack.length < 1) {
        return false;
    }
    const element = stack.pop();
    if (!element) return false; // Redundant but safe
    const h160 = hash160(element);
    stack.push(h160);
    return true;
};

const opHash256 = (stack: Buffer[]): boolean => {
    if (stack.length < 1) {
        return false;
    }
    const element = stack.pop();
    if (!element) return false; // Redundant but safe
    const h256 = hash256(element);
    stack.push(h256);
    return true;
};

const opEqual = (stack: Buffer[]): boolean => {
    if (stack.length < 2) {
        return false;
    }
    const element1 = stack.pop();
    const element2 = stack.pop();
    if (!element1 || !element2) return false; // Redundant but safe
    return element1.equals(element2);
};

const opVerify = (stack: Buffer[]): boolean => {
    if (stack.length < 1) {
        return false;
    }
    const element = stack.pop();
    return element! && element.length === 1 && element[0] !== 0;
};

const opEqualVerify = (stack: Buffer[]): boolean => {
    return opEqual(stack) && opVerify(stack);
};

const opCheckSig = (stack: Buffer[], z: Buffer): boolean => {
    if (stack.length < 2) {
        return false;
    }
    const secPubKey = stack.pop();
    const derSignature = stack.pop()?.slice(0, -1); // Remove the last byte (hash type)

    if (!secPubKey || !derSignature) return false;

    try {
        const pubKey = ECPair.fromPublicKey(secPubKey);
        const isValid = ecc.verify(z, pubKey.publicKey, derSignature);
        stack.push(encodeNum(isValid ? 1 : 0));
        return true;
    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
};

// Define the function types for the opcodes
export type OpFunction = (stack: Buffer[]) => boolean;
export type OpCheckSigFunction = (stack: Buffer[], z: Buffer) => boolean;

// Define the OP_CODE_FUNCTIONS with keys from the OpCode enum
export const OP_CODE_FUNCTIONS: { [key in OpCode]?: OpFunction | OpCheckSigFunction } = {
    [OpCode.OP_DUP]: opDup,
    [OpCode.OP_HASH160]: opHash160,
    [OpCode.OP_EQUALVERIFY]: opEqualVerify,
    [OpCode.OP_CHECKSIG]: opCheckSig,
};
