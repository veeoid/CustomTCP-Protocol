import {createServer} from "node:net";

import { ProtocolParser } from "./protocol/parser";


const server = createServer((client) => {
    console.log('Server Created.')

    const parser = new ProtocolParser((message) => {
        console.log('Parsed Message:', message);
    })

    client.on("data", (chunk) => {
        console.log('Received:', chunk);
    })

    client.on("end", () => {
        console.log('Client Disconnected');
    })

    client.on("error", (err) => {
        console.log('Socket Error', err);
    })
})


server.listen(9000, ()=> {
    console.log("Server listening on port 9000")
})
