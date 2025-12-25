// protocol/framing.js

import { PROTOCOL_VERSION, HEADER_SIZE } from "./constants.js";

/**
 * Build a full protocol message buffer
 * @param {number} type - Message type
 * @param {Buffer} payload - Payload buffer
 * @returns {Buffer}
 */
export function buildMessage(type, payload) {
  if (!Buffer.isBuffer(payload)) {
    throw new Error("Payload must be a Buffer");
  }

  // Create the header buffer
  const header = Buffer.alloc(HEADER_SIZE);

  // Set the version
  header.writeUInt8(PROTOCOL_VERSION, 0);

  // Set the message type
  header.writeUInt8(type, 1);

  // Set the payload length
  header.writeUInt32BE(payload.length, 2);

  // Put header and payload together
  return Buffer.concat([header, payload]);
}