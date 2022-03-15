
const udp = require("dgram");

const PORT = 12345;

function runServer() {
    return new Promise(resolve => {
        const server = udp.createSocket("udp4");

        server.on("error", error => console.error(`Server error: ${error}`));
        server.on("message", (msg, info) => {
            console.info(`[${info.address}:${info.port}]: ${msg.toString()}`);
            server.close();
        });
        server.on("listening", () => {
            const { address, port } = server.address();
            console.info(`Server listening at ${address}:${port}`);
            resolve();
        });
        server.on("close", () => "Server closed");

        server.bind(PORT);
    });
}

function runClient() {
    const client = udp.createSocket("udp4");
    client.on("error", error => console.error(`Client error: ${error}`));
    client.send("Hello world", PORT, "localhost", () => client.close());
}

runServer().then(() => runClient());
