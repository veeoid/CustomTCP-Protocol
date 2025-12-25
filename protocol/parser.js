// protocol/parser.js

import { HEADER_SIZE } from "./constants.js";

export class ProtocolParser {
  constructor(onMessage) {
    // Buffer that holds unprocessed bytes
    this.buffer = Buffer.alloc(0);

    // Callback to deliver parsed messages
    this.onMessage = onMessage;
  }

  /**
   * Push incoming bytes into the parser
   * @param {Buffer} chunk
   */
  push(chunk) {
    // 1. Append new bytes to existing buffer
    this.buffer = Buffer.concat([this.buffer, chunk]);

    // 2. Try to parse as many messages as possible
    this._parse();
  }

  /**
   * Internal parsing loop
   */
  _parse() {
    while (true) {
      // 3. Do we even have a full header?
      if (this.buffer.length < HEADER_SIZE) {
        return;
      }

      // 4. Read header fields
      const version = this.buffer.readUInt8(0);
      const type = this.buffer.readUInt8(1);
      const payloadLength = this.buffer.readUInt32BE(2);

      const totalMessageLength = HEADER_SIZE + payloadLength;

      // 5. Do we have the full message?
      if (this.buffer.length < totalMessageLength) {
        return;
      }

      // 6. Extract payload
      const payload = this.buffer.slice(
        HEADER_SIZE,
        totalMessageLength
      );

      // 7. Emit parsed message
      this.onMessage({
        version,
        type,
        payload,
      });

      // 8. Remove parsed message from buffer
      this.buffer = this.buffer.slice(totalMessageLength);
    }
  }
}