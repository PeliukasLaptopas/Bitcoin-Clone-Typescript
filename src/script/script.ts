import BufferReader from "buffer-reader";
import BitcoinVarint from "../utils/bitcoinVarint";
import { OP_CODE_FUNCTIONS, OpFunction } from "./opCodesFunctions";
import { OpCode } from "./opCodes";

export default class Script {
  public cmds: (number | Buffer)[];

  //To generate cmds use bitcoin.script.decompile(scriptPubKey | scriptSig)
  constructor(cmds: (number | Buffer)[] = []) {
      this.cmds = cmds;
  }

  combine(other: Script): Script {
    return new Script([...this.cmds, ...other.cmds]);
  }

  //super simple - only supports p2pkh
  public evaluate(z: Buffer): boolean {
    const cmds = [...this.cmds]; // Copy commands to safely modify
    const stack: Buffer[] = []; // Stack for evaluation

    while (cmds.length > 0) {
        const cmd = cmds.shift();
        if(cmd === undefined) { //todo fix this
          throw new Error("Cmd was undefined but tried to evaluate")
        }

        if(typeof cmd !== "number") { // Push data (Buffer) onto the stack
          console.log("Current DATA " + cmd.toString('hex'))
          stack.push(cmd);
        } else {                      // Operation
            console.log(OpCode[cmd as OpCode])
            // const operation = OP_CODE_FUNCTIONS[cmd as OpCode];

            // if (!operation) {
            //     throw new Error(`Unknown opcode: ${cmd as OpCode}`)
            // }
            
            // if (cmd === OpCode.OP_CHECKSIG) {
            //     if (!(operation as (stack: Buffer[], z: Buffer) => boolean)(stack, z)) {
            //         console.error(`Bad operation: OP_CHECKSIG (0xAC)`);
            //         return false;
            //     }
            // } else {
            //     // Execute the operation
            //     if (!(operation as OpFunction)(stack)) {
            //         console.error(`Bad operation: ${cmd}`);
            //         return false;
            //     }
            // }
        }
    }

    if (stack.length === 0) {
        console.error("Stack is empty at the end of script evaluation");
        return false;
    }

    const top = stack.pop();
    if (!top || top.equals(Buffer.alloc(0))) {
        console.error("Top stack item is an empty buffer");
        return false;
    }

    return true;
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
