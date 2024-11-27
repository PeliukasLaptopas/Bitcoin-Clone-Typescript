import BufferReader from 'buffer-reader';

export default class BitcoinVarint {
  // Helper function to convert a little-endian byte array to an integer
  static littleEndianToInt(bytes: Uint8Array): number {
    let result = 0;
    for (let i = 0; i < bytes.length; i++) {
      result |= bytes[i] << (i * 8);
    }
    return result;
  }

  // Helper function to convert an integer to a little-endian byte array
  static intToLittleEndian(value: number, byteLength: number): Uint8Array {
    const result = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      result[i] = value & 0xff;
      value >>= 8;
    }
    return result;
  }

  static readVarint(buffer: BufferReader): number {
    const firstByte = buffer.nextBuffer(1)[0];
    if (firstByte < 0xfd) {
      // Single-byte integer
      return firstByte;
    } else if (firstByte === 0xfd) {
      // Read next 2 bytes
      const nextBytes = buffer.nextBuffer(2);
      return this.littleEndianToInt(nextBytes);
    } else if (firstByte === 0xfe) {
      // Read next 4 bytes
      const nextBytes = buffer.nextBuffer(4);
      return this.littleEndianToInt(nextBytes);
    } else if (firstByte === 0xff) {
      // Read next 8 bytes
      const nextBytes = buffer.nextBuffer(8);
      return this.littleEndianToInt(nextBytes);
    } else {
      throw new Error("Invalid varint format");
    }
  }

  // Function to encode a number into a varint
  static encodeVarint(value: number): Uint8Array {
    if (value < 0xfd) {
      // Single-byte integer
      return new Uint8Array([value]);
    } else if (value <= 0xffff) {
      // 2-byte integer with 0xfd prefix
      const prefix = new Uint8Array([0xfd]);
      const littleEndianBytes = this.intToLittleEndian(value, 2);
      return new Uint8Array([...prefix, ...littleEndianBytes]);
    } else if (value <= 0xffffffff) {
      // 4-byte integer with 0xfe prefix
      const prefix = new Uint8Array([0xfe]);
      const littleEndianBytes = this.intToLittleEndian(value, 4);
      return new Uint8Array([...prefix, ...littleEndianBytes]);
    } else if (value <= Number.MAX_SAFE_INTEGER) {
      // 8-byte integer with 0xff prefix
      const prefix = new Uint8Array([0xff]);
      const littleEndianBytes = this.intToLittleEndian(value, 8);
      return new Uint8Array([...prefix, ...littleEndianBytes]);
    } else {
      throw new Error(`Integer too large: ${value}`);
    }
  }
}
