
const { spawn } = require('child_process');
const chalk = require("chalk");
const PORT = 44330;
const COMMON_SERVER_OPTIONS = `s_server -key private-key.pem -cert public-cert.pem -accept ${PORT} -quiet`.split(/ /);
const COMMON_CLIENT_OPTIONS = `s_client -4 -connect localhost:${PORT} -quiet`.split(/ /);
const OPENSSL_FLAVORS = {
    // the homebrew version right now is `LibreSSL 3.4.3` and enables DTLS v1.2
    homebrew: {
        bin: "/usr/local/opt/libressl/bin/openssl",
        serverOptions: COMMON_SERVER_OPTIONS.concat("-dtls1_2"),
        clientOptions: COMMON_CLIENT_OPTIONS.concat("-dtls1_2"),
    },
    // this is the system default, which on macOS 10.15.7 is `LibreSSL 2.8.3`
    default: {
        bin: "openssl",
        serverOptions: COMMON_SERVER_OPTIONS.concat("-dtls1"),
        clientOptions: COMMON_CLIENT_OPTIONS.concat("-dtls1"),
    }
}
const OPENSSL = OPENSSL_FLAVORS.homebrew;
const OPENSSL_BIN = OPENSSL.bin;
const OPENSSL_SERVER_OPTIONS = OPENSSL.serverOptions;
const OPENSSL_CLIENT_OPTIONS = OPENSSL.clientOptions;

function startServer() {
    return new Promise(resolve => {
        const server = spawn(OPENSSL_BIN, OPENSSL_SERVER_OPTIONS);

        server.on("spawn", () => {
            console.info("Server started.");
            resolve();
        });

        server.stdout.on('data', (data) => {
            console.log(chalk.blue(`[server] ${data}`));
        });

        server.stderr.on('data', (data) => {
            console.error(chalk.red(`[server] ${data}`));
        });

        server.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });
}

function startClient() {
    const client = spawn(OPENSSL_BIN, OPENSSL_CLIENT_OPTIONS);

    client.on("spawn", () => {
        console.info("Client started");
        client.stdin.write("hello\n");
    });

    client.stdout.on('data', (data) => {
        console.log(chalk.blue(`[client] ${data}`));
    });

    client.stderr.on('data', (data) => {
        console.error(chalk.red(`[client] ${data}`));
    });

    client.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

startServer().then(() => startClient());
