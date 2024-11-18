// import { describe, it, expect, beforeEach } from 'vitest';
// import Point from "../point";
//
// describe('Point', () => {
//     let a: Point;
//     let b: Point;
//
//     beforeEach(() => {
//         a = new Point(3, 7, 5, 7);
//         b = new Point(-1, -1, 5, 7);
//     });
//
//     it('should check equality and inequality', () => {
//         const c = new Point(3, 7, 5, 7);
//         expect(a.equals(c)).toBe(true);
//         expect(a.notEquals(b)).toBe(true);
//     });
//
//     it('should add a point at infinity', () => {
//         const infinity = new Point(null, null, 5, 7);
//         const result = a.add(infinity);
//         expect(result.equals(a)).toBe(true);
//     });
//
//     it('should add two points correctly', () => {
//         const result = a.add(b);
//         expect(result.equals(new Point(2, -5, 5, 7))).toBe(true);
//     });
//
//     it('should handle point doubling correctly', () => {
//         const result = b.add(b);
//         expect(result.equals(new Point(18, 77, 5, 7))).toBe(true);
//     });
// });
