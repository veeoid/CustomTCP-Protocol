// protocol/framing.js

import { PROTOCOL_VERSION, HEADER_SIZE } from "./constants.js";

/**
 * Build a full protocol message buffer
 *
 * @param {number} type - Message type (1 byte)
 * @param {Buffer} payload - Payload buffer
 * @returns {Buffer}
 */
export function buildMessage(type, payload) {
  if (!Buffer.isBuffer(payload)) {
    throw new Error("Payload must be a Buffer");
  }

  // Allocate header
  const header = Buffer.alloc(HEADER_SIZE);

  // Version
  header.writeUInt8(PROTOCOL_VERSION, 0);

  // Message type
  header.writeUInt8(type, 1);

  // Payload length (4 bytes, big-endian)
  header.writeUInt32BE(payload.length, 2);

  // Concatenate header + payload
  return Buffer.concat([header, payload]);
}