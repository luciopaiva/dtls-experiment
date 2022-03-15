
# Node.js DTLS experiment

This is a simple experiment to see how easy it is to implement a DTLS client/server on Node.js

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
