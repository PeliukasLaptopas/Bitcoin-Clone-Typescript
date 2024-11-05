export default class Point {
  x: number | null;
  y: number | null;
  a: number;
  b: number;

  constructor(x: number | null, y: number | null, a: number, b: number) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;

    if (this.x === null && this.y === null) return;

    if (this.x === null || this.y === null) {
      throw new Error("Both x and y must be non-null or both should be null for the point at infinity.");
    }

    if (this.y ** 2 !== this.x ** 3 + a * this.x + b) {
      throw new Error(`(${x}, ${y}) is not on the curve`);
    }
  }


  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y && this.a === other.a && this.b === other.b;
  }

  notEquals(other: Point): boolean {
    return !this.equals(other);
  }

  toString(): string {
    return this.x === null ? 'Point(infinity)' : `Point(${this.x},${this.y})_${this.a}_${this.b}`;
  }

  add(other: Point): Point {
    if (this.a !== other.a || this.b !== other.b) {
      throw new TypeError(`Points ${this} and ${other} are not on the same curve`);
    }

    if (this.x === null) return other;
    if (other.x === null) return this;

    if (this.x === other.x && this.y !== other.y) {
      return new Point(null, null, this.a, this.b);
    }

    if (this.x !== other.x) {
      const s = (other.y! - this.y!) / (other.x - this.x);
      const x3 = s ** 2 - this.x - other.x;
      const y3 = s * (this.x - x3) - this.y!;
      return new Point(x3, y3, this.a, this.b);
    }

    if (this.equals(other) && this.y === 0) {
      return new Point(null, null, this.a, this.b);
    }

    if (this.equals(other)) {
      const s = (3 * this.x! ** 2 + this.a) / (2 * this.y!);
      const x = s ** 2 - 2 * this.x!;
      const y = s * (this.x! - x) - this.y!;
      return new Point(x, y, this.a, this.b);
    }

    throw new Error("Unhandled case in point addition");
  }
}