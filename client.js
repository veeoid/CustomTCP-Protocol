import {createConnection} from "node:net";

const PORT = '9000';

const client = createConnection({port:PORT}, () => {
    console.log('Client connected to Server');

    const message = Buffer.from("Hello from client");
    client.write(message);
});

client.on('data', (chunk) => {
    console.log("Client received:", chunk);
})

client.on("end", () => {
    console.log('Disconnected from server');
})

client.on("error", (err) => {
    console.log('Connection Error:', err)
})