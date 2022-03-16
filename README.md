
# Node.js DTLS experiment

This is a simple experiment to see how easy it is to implement a DTLS client/server on Node.js. Unfortunately, Node.js doesn't support DTLS and there is no npm library available either. The closest library to something that could be useful is `@nodertc/dtls`, but it only implements the client part. I even tried `npm i github:nodertc/dtls#ee9a8e1` to fetch the most recent commit to date - which mentions a server part - but it doesn't work either as the server implementation is not complete. So my idea here is to cheat and use openssl cli tool to open both the client and the server and then send/receive data via pipes.

## Setup

The first step is to generate a certificate for the server side. You will find certificates already generated in this repo, but I wanted to document here how I generated them anyway:

    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

In the questions part, I answered only `Common Name` as `localhost` and just hit return for everything else.

There is the basic command for starting a simple server:

    openssl s_server -key key.pem -cert cert.pem -accept 44330 -dtls1

And this is how you could open a client:

    openssl s_client -dtls1 -connect 127.0.0.1:44330 -debug

You can try it now in the command line and see it working. Once the client is started, try typing anything in the terminal and hit return to see the server echo it on its terminal.

---

The first test is `udp-test.js`, which shows a simple UDP transmission:

![udp-test.png](udp-test.png)

Then we get to `tls-test.js`, where a secure TCP connection is established:

![tls-test.png](tls-test.png)

Finally, there's `dtls-test.js`, which goes back to a UDP conversation, but now secured via DTLS.

This command was used to generate the private key:

    openssl genrsa -out private-key.pem 1024

Then to generate the certificate request:

    openssl req -new -key private-key.pem -out csr.pem

In the form, fill in `Common Name` with `localhost`.

Finally, to issue the self-signed certificate:

    openssl x509 -req -in csr.pem -signkey private-key.pem -out public-cert.pem
