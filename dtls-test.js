
const { spawn } = require('child_process');
const chalk = require("chalk");

const PORT = 44330;
const PAYLOAD_SIZE = 100;
const PAYLOAD = "x".repeat(PAYLOAD_SIZE);
const COMMON_SERVER_OPTIONS = `s_server -key private-key.pem -cert public-cert.pem -accept ${PORT} -quiet`.split(/ /);
const COMMON_CLIENT_OPTIONS = `s_client -4 -connect localhost:${PORT} -quiet`.split(/ /);
const OPENSSL_FLAVORS = {
    // the homebrew version right now is `LibreSSL 3.4.3` and enables DTLS v1.2
    homebrewLibreSSSL: {  // brew install libressl
        bin: "/usr/local/opt/libressl/bin/openssl",
        serverOptions: COMMON_SERVER_OPTIONS.concat("-dtls1_2"),
        clientOptions: COMMON_CLIENT_OPTIONS.concat("-dtls1_2"),
    },
    // the homebrew version right now is `OpenSSL 1.1.1m` and supports DTLS v1.2 too
    homebrewOpenSSLv1_1: {  // brew install openssl@1.1
        bin: "/usr/local/Cellar/openssl@1.1/1.1.1m/bin/openssl",
        serverOptions: COMMON_SERVER_OPTIONS.concat("-dtls1_2"),
        clientOptions: COMMON_CLIENT_OPTIONS.concat("-dtls1_2"),
    },
    // the homebrew version right now is `OpenSSL 3.0.2` and supports DTLS v1.2 too
    homebrewOpenSSLv3_0: {  // brew install openssl@3
        bin: "/usr/local/opt/openssl@3/bin/openssl",
        serverOptions: COMMON_SERVER_OPTIONS.concat("-dtls1_2"),
        clientOptions: COMMON_CLIENT_OPTIONS.concat("-dtls1_2"),
    },
    // this is the system default, which on macOS Catalina is `LibreSSL 2.8.3` and only supports DTLS v1.0
    default: {
        bin: "openssl",
        serverOptions: COMMON_SERVER_OPTIONS.concat("-dtls1"),
        clientOptions: COMMON_CLIENT_OPTIONS.concat("-dtls1"),
    }
}
const OPENSSL = OPENSSL_FLAVORS.homebrewOpenSSLv3_0;
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
        client.stdin.write(`${PAYLOAD}\n`);
    });

    client.stdout.on('data', (data) => {
        console.log(chalk.greenBright(`[client] ${data}`));
    });

    client.stderr.on('data', (data) => {
        console.error(chalk.yellow(`[client] ${data}`));
    });

    client.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

startServer().then(() => startClient());
