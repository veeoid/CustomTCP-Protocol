// protocol/constants.js

export const PROTOCOL_VERSION = 1;
export const HEADER_SIZE = 6;

export const MESSAGE_TYPES = {
  CONNECT: 1,
  DATA: 2,
  ACK: 3,
  ERROR: 4,
  CLOSE: 5,
};

export const ERROR_CODES = {
  INVALID_STATE: 1,
  UNKNOWN_MESSAGE: 2,
  MALFORMED_PAYLOAD: 3,
};