export default class FieldElement {
  num: number;
  prime: number;

  constructor(num: number, prime: number) {
    if (num >= prime || num < 0) {
      throw new Error(`Num ${num} not in field range 0 to ${prime - 1}`);
    }
    this.num = num;
    this.prime = prime;
  }

  toString(): string {
    return `FieldElement_${this.prime}(${this.num})`;
  }

  equals(other: FieldElement | null): boolean {
    if (other === null) return false;
    return this.num === other.num && this.prime === other.prime;
  }

  notEquals(other: FieldElement | null): boolean {
    return !this.equals(other);
  }

  add(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new TypeError('Cannot add two numbers in different Fields');
    }
    const num = (this.num + other.num) % this.prime;
    return new FieldElement(num, this.prime);
  }

  sub(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new TypeError('Cannot subtract two numbers in different Fields');
    }
    const num = (this.num - other.num + this.prime) % this.prime;
    return new FieldElement(num, this.prime);
  }

  mul(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new TypeError('Cannot multiply two numbers in different Fields');
    }
    const num = (this.num * other.num) % this.prime;
    return new FieldElement(num, this.prime);
  }

  pow(exponent: number): FieldElement {
    const n = exponent % (this.prime - 1);
    const num = Math.pow(this.num, n) % this.prime;
    return new FieldElement(num, this.prime);
  }

  div(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new TypeError('Cannot divide two numbers in different Fields');
    }
    const num = (this.num * Math.pow(other.num, this.prime - 2) % this.prime) % this.prime;
    return new FieldElement(num, this.prime);
  }
}
