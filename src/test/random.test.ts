// import { describe, it, expect, beforeEach } from 'vitest';
// import FieldElement from "../fieldElement";
//
// describe('FieldElement', () => {
//     let a: FieldElement;
//     let b: FieldElement;
//
//     beforeEach(() => {
//         a = new FieldElement(2, 31);
//         b = new FieldElement(15, 31);
//     });
//
//     it('should check equality and inequality', () => {
//         const c = new FieldElement(2, 31);
//         const d = new FieldElement(15, 31);
//
//         expect(a.equals(c)).toBe(true);
//         expect(a.notEquals(b)).toBe(true);
//         expect(a.notEquals(c)).toBe(false);
//     });
//
//     it('should add elements correctly', () => {
//         const result = a.add(b);
//         expect(result.equals(new FieldElement(17, 31))).toBe(true);
//     });
//
//     it('should subtract elements correctly', () => {
//         const a = new FieldElement(29, 31);
//         const b = new FieldElement(4, 31);
//         const result = a.sub(b);
//         expect(result.equals(new FieldElement(25, 31))).toBe(true);
//     });
//
//     it('should multiply elements correctly', () => {
//         const a = new FieldElement(24, 31);
//         const b = new FieldElement(19, 31);
//         const result = a.mul(b);
//         expect(result.equals(new FieldElement(22, 31))).toBe(true);
//     });
//
//     it('should raise elements to a power correctly', () => {
//         const a = new FieldElement(17, 31);
//         const result = a.pow(3)
//         expect(result.equals(new FieldElement(15, 31))).toBe(true);
//     });
//
//     it('should divide elements correctly', () => {
//         const a = new FieldElement(3, 31);
//         const b = new FieldElement(24, 31);
//         const result = a.div(b);
//         expect(result.equals(new FieldElement(4, 31))).toBe(true);
//     });
// });
