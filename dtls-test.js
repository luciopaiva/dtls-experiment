
const udp = require("dgram");
const dtls = require("@nodertc/dtls");

const PORT = 12345;

function startServer() {
    return new Promise(resolve => {
        const serverSocket = udp.createSocket("udp4");
        serverSocket.bind(PORT, () => resolve());

        const server = dtls.createServer({ socket: serverSocket });
        server.on("error", error => console.error(error));
        server.on("data", data => {
            console.info(`[server] received: ${data.toString("utf8")}`);
        });
        server.on("connect", () => {
            console.info(`[server] client connected`);
            server.write("Hello", () => server.close());
        });
        server.on("close", () => console.info(`[server] closed`));
    });

}

function startClient() {
    const socket = dtls.connect({
        type: "udp4",
        remotePort: PORT,
        remoteAddress: "127.0.0.1",
    });

    socket.on("error", error => console.error(error));
    socket.on("data", data => {
        console.info(`[client] received: ${data.toString("utf8")}`);
        socket.close();
    });
    socket.once("connect", () => socket.write("Hello world"));
}

startServer().then(() => startClient());
