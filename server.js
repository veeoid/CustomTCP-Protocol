import { createServer } from "node:net";

import { ProtocolParser } from "./protocol/parser.js";
import { buildMessage } from "./protocol/framing.js";
import { MESSAGE_TYPES } from "./protocol/constants.js";
import { ServerStateMachine } from "./protocol/stateMachine.js";

const PORT = 9000;

const server = createServer((client) => {
  console.log("Client connected");

  // One state machine per connection
  const stateMachine = new ServerStateMachine();

  // One parser per connection
  const parser = new ProtocolParser((message) => {
    const { type, payload } = message;

    try {
      // ---- CONNECT ----
      if (type === MESSAGE_TYPES.CONNECT) {
        stateMachine.onConnect();

        const clientIdLength = payload.readUInt8(0);
        const clientId = payload
          .slice(1, 1 + clientIdLength)
          .toString("utf8");

        console.log(`CONNECT received from clientId: ${clientId}`);

        // Build ACK payload: [acknowledgedType, status]
        const ackPayload = Buffer.from([
          MESSAGE_TYPES.CONNECT,
          0x00, // success
        ]);

        const ackMessage = buildMessage(
          MESSAGE_TYPES.ACK,
          ackPayload
        );

        client.write(ackMessage);
        return;
      }

      // ---- DATA ----
        if (type === MESSAGE_TYPES.DATA) {
        stateMachine.onData();

        const data = payload.toString("utf8");
        console.log(`DATA received: ${data}`);

        // ACK DATA
        const ackPayload = Buffer.from([
            MESSAGE_TYPES.DATA, // acknowledging DATA
            0x00,               // success
        ]);

        const ackMessage = buildMessage(
            MESSAGE_TYPES.ACK,
            ackPayload
        );

        client.write(ackMessage);
        return;
        }

      // ---- Unknown message type ----
      console.log("Unknown message type:", type);
      client.end();

    } catch (err) {
      console.error("Protocol violation:", err.message);
      client.end();
    }
  });



  // Feed incoming bytes into the parser
  client.on("data", (chunk) => {
    parser.push(chunk);
  });

  client.on("end", () => {
    console.log("Client disconnected");
  });

  client.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function buildErrorPayload(errorCode, message) {
  const messageBuffer = Buffer.from(message, "utf8");

  return Buffer.concat([
    Buffer.from([errorCode]),
    Buffer.from([messageBuffer.length]),
    messageBuffer,
  ]);
}