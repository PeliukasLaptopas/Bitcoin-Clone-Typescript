import BufferReader from "buffer-reader";
import BitcoinVarint from "../utils/bitcoinVarint";

export default class Script {
  public cmds: (number | Buffer)[];

  constructor(cmds: (number | Buffer)[] = []) {
      this.cmds = cmds;
  }

  combine(other: Script): Script {
    return new Script([...this.cmds, ...other.cmds]);
  }

  public static parse(buffer: BufferReader): Script {
      const cmds: (number | Buffer)[] = [];
      const length = BitcoinVarint.readVarint(buffer);
      let count = 0;

      while (count < length) {
          const currentByte = buffer.nextUInt8();
          count += 1;

          //since current byte is between 1 and 75 this means that we need to push data to stack.
          //data that we are pushing is sequential from current position to size of current byte.
          if (currentByte >= 1 && currentByte <= 75) {
              // Push data of size `currentByte`
              const dataLength = currentByte;
              const data = buffer.nextBuffer(dataLength);
              cmds.push(data);
              count += dataLength;
          } else if (currentByte === 76) {
              // OP_PUSHDATA1 - the next byte tells us how many bytes to read
              const dataLength = BitcoinVarint.littleEndianToInt(buffer.nextBuffer(1));
              count += 1;
              const data = buffer.nextBuffer(dataLength);
              cmds.push(data);
              count += dataLength;
          } else if (currentByte === 77) {
              // OP_PUSHDATA2 - the next two bytes tell us how many bytes to read
              const dataLength = BitcoinVarint.littleEndianToInt(buffer.nextBuffer(2));
              count += 2;
              const data = buffer.nextBuffer(dataLength);
              cmds.push(data);
              count += dataLength;
          } else {
              // Opcode
              const opCode = currentByte;
              cmds.push(opCode);
          }
      }

      if (count !== length) {
          throw new SyntaxError("Script parsing error: mismatched length");
      }

      return new Script(cmds);
  }

  public rawSerialize(): Buffer {
    let result = Buffer.alloc(0);

    for (const cmd of this.cmds) {
      if (typeof cmd === "number") {
        // Serialize opcode as a 1-byte little-endian integer
        const opcodeBuffer = Buffer.alloc(1);
        opcodeBuffer.writeUIntLE(cmd, 0, 1);
        result = Buffer.concat([result, opcodeBuffer]);
      } else if (Buffer.isBuffer(cmd)) {
        // Serialize data push
        const length = cmd.length;
        if (length < 75) {
          // Small data push
          const lengthBuffer = Buffer.alloc(1);
          lengthBuffer.writeUIntLE(length, 0, 1);
          result = Buffer.concat([result, lengthBuffer, cmd]);
        } else if (length >= 75 && length < 0x100) {
          // OP_PUSHDATA1
          const pushData1Buffer = Buffer.alloc(2);
          pushData1Buffer.writeUIntLE(76, 0, 1); // OP_PUSHDATA1
          pushData1Buffer.writeUIntLE(length, 0, 1);
          result = Buffer.concat([result, pushData1Buffer, cmd]);
        } else if (length >= 0x100 && length <= 520) {
          // OP_PUSHDATA2
          const pushData2Buffer = Buffer.alloc(2);
          pushData2Buffer.writeUIntLE(77, 0, 1); // OP_PUSHDATA2
          pushData2Buffer.writeUInt16LE(length);
          result = Buffer.concat([result, pushData2Buffer, cmd]);
        } else {
          throw new Error("Command too long");
        }
      } else {
        throw new Error("Unsupported command type");
      }
    }

    return result;
  }

  public serialize(): Buffer {
    const rawResult = this.rawSerialize();
    const totalLengthVarint = BitcoinVarint.encodeVarint(rawResult.length);
    return Buffer.concat([totalLengthVarint, rawResult]);
  }
}
