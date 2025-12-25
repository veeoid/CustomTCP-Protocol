// protocol/stateMachine.js

export const CLIENT_STATES = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTED: "CONNECTED",
  READY: "READY",
  CLOSED: "CLOSED",
};

export const SERVER_STATES = {
  NEW: "NEW",
  READY: "READY",
  CLOSED: "CLOSED",
};

// Client State Machine
export class ClientStateMachine {
  constructor() {
    this.state = CLIENT_STATES.DISCONNECTED;
  }

  onConnect() {
    if (this.state !== CLIENT_STATES.DISCONNECTED) {
      throw new Error("CONNECT not allowed in current client state");
    }
    this.state = CLIENT_STATES.CONNECTED;
  }

  onConnectAck() {
    if (this.state !== CLIENT_STATES.CONNECTED) {
      throw new Error("Unexpected CONNECT ACK");
    }
    this.state = CLIENT_STATES.READY;
  }

  onClose() {
    this.state = CLIENT_STATES.CLOSED;
  }
}

// Server State Machine
export class ServerStateMachine {
  constructor() {
    this.state = SERVER_STATES.NEW;
  }

  onConnect() {
    if (this.state !== SERVER_STATES.NEW) {
      throw new Error("CONNECT not allowed in current server state");
    }
    this.state = SERVER_STATES.READY;
  }

  onData() {
    if (this.state !== SERVER_STATES.READY) {
      throw new Error("DATA not allowed before CONNECT");
    }
  }

  onClose() {
    this.state = SERVER_STATES.CLOSED;
  }
}