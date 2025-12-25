// protocol/parser.js

import { HEADER_SIZE } from "./constants.js";

export class ProtocolParser {
  constructor(onMessage) {
    // Holds bytes that haven't been processed yet
    this.buffer = Buffer.alloc(0);

    // Function to call when we parse a message
    this.onMessage = onMessage;
  }

  // Push new data into the parser
  push(chunk) {
    // Add the new chunk to our buffer
    this.buffer = Buffer.concat([this.buffer, chunk]);

    // Try to parse as many messages as we can
    this._parse();
  }

  // Internal method to parse messages from the buffer
  _parse() {
    while (true) {
      // If we don't have enough bytes for a header, wait
      if (this.buffer.length < HEADER_SIZE) {
        return;
      }

      // Read the header info
      const version = this.buffer.readUInt8(0);
      const type = this.buffer.readUInt8(1);
      const payloadLength = this.buffer.readUInt32BE(2);

      const totalMessageLength = HEADER_SIZE + payloadLength;

      // If we don't have the full message yet, wait
      if (this.buffer.length < totalMessageLength) {
        return;
      }

      // Grab the payload
      const payload = this.buffer.slice(
        HEADER_SIZE,
        totalMessageLength
      );

      // Send the message to the callback
      this.onMessage({
        version,
        type,
        payload,
      });

      // Remove the processed bytes from the buffer
      this.buffer = this.buffer.slice(totalMessageLength);
    }
  }
}