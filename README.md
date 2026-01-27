## jwt-generator

Simple pnpm-based Node.js project that generates a JSON Web Token (JWT) with a random subject. The resulting token data can be shared with or consumed by another system.

### Requirements

- Node.js (any modern LTS is fine)
- `pnpm` installed globally

### Install dependencies

```bash
pnpm install
```

### Generate a JWT (default HS256 / shared secret)

This will print a JSON object with the random subject, JWT token, algorithm, secret, and the fully decoded token (header, payload, and signature):

```bash
pnpm start
# or
pnpm run generate
```

Example output:

```json
{
  "subject": "randomSubjectIdHere",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhQmMxMjMiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.abc123signature",
  "algorithm": "HS256",
  "secret": "changeme-secret",
  "decoded": {
    "header": {
      "alg": "HS256",
      "typ": "JWT"
    },
    "payload": {
      "sub": "randomSubjectIdHere",
      "iat": 1700000000,
      "exp": 1700003600
    },
    "signature": "abc123signature"
  }
}
```

### Configuring the shared secret
By default the secret is `changeme-secret`. To use a custom shared secret (for example, one agreed with another system that will verify the JWT), set the `JWT_SECRET` environment variable:

```bash
JWT_SECRET="my-shared-secret" pnpm start
```

The other system should verify the token using:

- `HS256` algorithm
- the same shared secret (`JWT_SECRET`)

### Using RS256 with a private key and X.509 certificate

Some systems prefer (or require) validating JWTs using an X.509 certificate containing the public key used to verify signatures. In that case, you can switch this tool to use an asymmetric key pair and `RS256`:

1. Generate a private key and self-signed certificate (example with OpenSSL):

   ```bash
   openssl genrsa -out jwt-private.pem 2048
   openssl req -new -x509 -key jwt-private.pem -out jwt-cert.pem -days 365 -subj "/CN=my-jwt-issuer"
   ```

2. Run the generator in RS256 mode:

   ```bash
   JWT_ALG=RS256 \
   JWT_PRIVATE_KEY_FILE=./jwt-private.pem \
   JWT_CERT_FILE=./jwt-cert.pem \
   pnpm start
   ```

The output JSON will now include:

- `algorithm: "RS256"`
- `keyType: "asymmetric"`
- `privateKeyFile`: path to the private key file used for signing
- `certificateFile`: path to the X.509 certificate file (if provided)
- `certificate`: the full PEM-encoded X.509 certificate contents (if provided)

You can then configure the other system to:

- use `RS256` as the JWT verification algorithm
- paste or upload the X.509 certificate (the `certificate` value from the JSON output, or the `jwt-cert.pem` file)

In RS256 mode, the private key itself is never included in the JSON output, only the path to the file used for signing.
