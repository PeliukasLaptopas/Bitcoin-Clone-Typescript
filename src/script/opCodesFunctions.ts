import * as bitcoin from 'bitcoinjs-lib';
import { OpCode } from './opCodes';
import * as secp256k1 from 'secp256k1';

/**
 * Number zero which pushes an empty byte array onto the stack
 * @param stack
 */
export function op0(stack: Buffer[]): boolean {
    stack.push(encodeNum(0));
    return true;
}
  
/**
 * Pushes a number onto the stack
 * @param stack
 */
export function op1(stack: Buffer[]): boolean {
    stack.push(encodeNum(1));
    return true;
}
    
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

/*
If the two elements are equal, the result is true (represented as a single Buffer containing 0x01).
If the two elements are not equal, the result is false (represented as an empty Buffer, Buffer.alloc(0)).
*/
export function opEqual(stack: Buffer[]): boolean {
    if (stack.length < 2) {
      return false;
    }
  
    const a = stack.pop()!;
    const b = stack.pop()!;
    const result = a.equals(b);
  
    if (!result) {
      op0(stack);
    } else {
      op1(stack);
    }
  
    return true;
}


export function opVerify(stack: Buffer[]): boolean {
    if (stack.length === 0) {
        return false;
    }

    if (Buffer.alloc(0).equals(stack.pop()!)) {
        return false;
    }

    return true;
}

const opEqualVerify = (stack: Buffer[]): boolean => {
    return opEqual(stack) && opVerify(stack);
};

const opCheckSig = (stack: Buffer[], z: Buffer): boolean => {
    if (stack.length < 2) {
        return false;
    }

    let pubKey = stack.pop()!;
    let sig = stack.pop()!;
    if (sig.byteLength !== 71 && sig.byteLength !== 72) throw new Error(`Sig must be 71/72 bytes, got ${sig.byteLength}`);

    const sigDEC = sig.subarray(0, sig.byteLength - 1);  // Remove the last byte (hash type)
    
    try {
        const signature = secp256k1.signatureImport(sigDEC);
        const isValid = secp256k1.ecdsaVerify(signature, z, pubKey);
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
