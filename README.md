# CustomTcpProtocol

This project is a custom binary protocol built directly on top of raw TCP using Node.js.

The goal wasn't to build something flashy. The goal was to understand, from first principles, how real protocols work under the hood once you remove HTTP, gRPC, and all the abstractions that usually hide the details.

## Why I built this

TCP gives you a reliable stream of bytes. That's it.

It does not give you:

- message boundaries
- message types
- request/response structure
- ordering rules
- error semantics

All of those things come from protocols built on top of TCP.

Instead of using an existing protocol, I wanted to build one myself and understand exactly how framing, parsing, state, and error handling actually work.

## What this project does

CustomTcpProtocol implements a small but complete application-level protocol with:

- A binary wire format
- Length-prefixed message framing
- Stream-safe parsing
- A CONNECT handshake
- DATA messages
- ACK responses
- Explicit state machines
- Structured ERROR messages

Everything runs directly on raw TCP sockets. No protocol libraries. No shortcuts.

## Protocol format

Every message sent over the wire has this structure:

```
[ version ][ type ][ payload length ][ payload ]
```

| Field | Size |
|-------|------|
| version | 1 byte |
| type | 1 byte |
| payload length | 4 bytes (big-endian) |
| payload | N bytes |

The header is always 6 bytes.
The payload size is known before reading the payload.

This is what allows safe parsing on top of a TCP stream.

## Message types

| Type | Direction | Meaning |
|------|-----------|---------|
| CONNECT | Client → Server | Start a session |
| DATA | Client → Server | Send application data |
| ACK | Server → Client | Acknowledge a message |
| ERROR | Server → Client | Report protocol violation |
| CLOSE | Either | Graceful shutdown (optional) |

### CONNECT message

CONNECT is the first message a client must send.

Payload format:

```
[ clientIdLength ][ clientId bytes ]
```

This keeps the handshake simple while still exercising payload parsing.

### ACK message

ACK is used by the server to confirm successful processing.

Payload format:

```
[ acknowledgedMessageType ][ status ]
```

Status:

- 0x00 → success

### ERROR message

Instead of silently closing the connection on invalid behavior, the server sends a structured ERROR message.

Payload format:

```
[ errorCode ][ messageLength ][ message bytes ]
```

This makes failures explicit and debuggable.

## Parsing strategy

TCP delivers bytes as a continuous stream. A single read can contain:

- part of a message
- exactly one message
- multiple messages

To handle this correctly, each connection maintains a buffer.

Parsing logic:

1. Append incoming bytes to a buffer
2. Check if a full header is available
3. Read payload length
4. Check if the full message has arrived
5. Extract one message
6. Remove parsed bytes from the buffer
7. Repeat

This guarantees correctness regardless of how data is chunked.

## State machines

The protocol enforces ordering rules using explicit state machines.

### Server states

| State | Allowed messages |
|-------|------------------|
| NEW | CONNECT |
| READY | DATA |
| CLOSED | none |

Any invalid message order results in an ERROR and connection close.

### Client flow

1. Connect to server
2. Send CONNECT
3. Wait for ACK
4. Send DATA
5. Receive ACK

This mirrors how real request-response protocols behave.

## Project structure

```
CustomTcpProtocol/
├── server.js
├── client.js
├── protocol/
│   ├── constants.js
│   ├── framing.js
│   ├── parser.js
│   └── stateMachine.js
└── package.json
```

All protocol logic lives in `protocol/`.
The client and server are thin wrappers around it.

## How to run

Start the server:

```bash
npm run server
```

Run the client:

```bash
npm run client
```

### Expected output:

**Server:**

```
Server listening on port 9000
Client connected
CONNECT from client-1
DATA: Hello from DATA
```

**Client:**

```
Client connected
CONNECT acknowledged
DATA acknowledged
```

## What this project demonstrates

- How message boundaries are created on top of TCP
- Why buffering is required for correctness
- How binary framing and parsing actually work
- How protocol rules are enforced with state machines
- How real systems report errors instead of failing silently

## What this project intentionally does not do

- Encryption or TLS
- Compression
- Performance tuning
- Production hardening

The focus is correctness, clarity, and understanding.