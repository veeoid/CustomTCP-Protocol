import { createConnection } from "node:net";

import { ProtocolParser } from "./protocol/parser.js";
import { buildMessage } from "./protocol/framing.js";
import { MESSAGE_TYPES } from "./protocol/constants.js";

const client = createConnection({ port: 9000 }, () => {
  console.log("Client connected");

  const id = Buffer.from("client-1");
  const payload = Buffer.concat([
    Buffer.from([id.length]),
    id,
  ]);

  const connect = buildMessage(
    MESSAGE_TYPES.CONNECT,
    payload
  );

  client.write(connect);
});

const parser = new ProtocolParser((message) => {
  const { type, payload } = message;

  if (type === MESSAGE_TYPES.ACK) {
    const acked = payload.readUInt8(0);

    if (acked === MESSAGE_TYPES.CONNECT) {
      console.log("CONNECT acknowledged");

      const data = buildMessage(
        MESSAGE_TYPES.DATA,
        Buffer.from("Hello from DATA")
      );

      client.write(data);
    }

    if (acked === MESSAGE_TYPES.DATA) {
      console.log("DATA acknowledged");
    }
  }

  if (type === MESSAGE_TYPES.ERROR) {
    const code = payload.readUInt8(0);
    const len = payload.readUInt8(1);
    const msg = payload.slice(2, 2 + len).toString();

    console.error(`ERROR (${code}): ${msg}`);
    client.end();
  }
});

client.on("data", (chunk) => parser.push(chunk));