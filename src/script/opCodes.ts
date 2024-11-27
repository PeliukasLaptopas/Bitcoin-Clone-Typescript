import { createHash } from 'crypto';

function hash160(data: string | Buffer): string {
    const sha256 = createHash('sha256').update(data).digest();
    const ripemd160 = createHash('ripemd160').update(sha256).digest();
    return ripemd160.toString('hex');
}

export function opHash160(stack: string[]): boolean {
    if (stack.length < 1) {
        return false;
    }
    const element = stack.pop() as string;
    const h160 = hash160(Buffer.from(element, 'utf-8'));
    stack.push(h160);
    return true;
}
    
export function opDup(stack: string[]): boolean {
    if (stack.length < 1) {
        return false;
    }
    stack.push(stack[stack.length - 1]);
    return true;
}

export function opHash256(stack: string[]): boolean {
    if (stack.length < 1) {
        return false;
    }
    const element = stack.pop() as string;
    const hash = createHash('sha256').update(createHash('sha256').update(element).digest()).digest();
    stack.push(hash.toString('hex'));
    return true;
}

export const OP_CODE_FUNCTIONS: { [key: number]: (stack: string[]) => boolean } = {
    0x76: opDup,
    0xaa: opHash256,
};
