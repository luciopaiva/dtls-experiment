
const tls = require("tls");
const fs = require("fs");

const PORT = 12345;

function runServer() {
    return new Promise(resolve => {
        const server = tls.createServer({
            key: fs.readFileSync("private-key.pem"),
            cert: fs.readFileSync("public-cert.pem"),
        });

        server.on("error", error => console.error(`[server] Error: ${error}`));
        server.on("secureConnection", socket => {
            const { remoteAddress, remotePort } = socket;
            console.info(`[server] Client ${remoteAddress}:${remotePort} connected. Sending data...`);
            socket.write("Hello!", () => server.close());
        });
        server.on("listening", () => {
            const { address, port } = server.address();
            console.info(`[server] Listening at ${address}:${port}`);
            resolve();
        });
        server.on("close", () => "Server closed");

        server.listen(PORT, "0.0.0.0");
    });
}

function runClient() {
    const socket = tls.connect(PORT, "localhost", {
        family: 4,
        ca: [fs.readFileSync("public-cert.pem")],
    });
    socket.setEncoding("utf8");
    socket.on("secureConnect", () => console.info(`[client] Connected`));
    socket.on("data", data => {
        console.info(`[client] received data from server: ${data}`);
        socket.destroy();
    });
    socket.on("end", () => console.info("[client] server closed connection"));
}

runServer().then(() => runClient());
