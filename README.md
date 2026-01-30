## jwt-generator

Simple pnpm-based Node.js project that generates a JSON Web Token (JWT) with a subject (random by default, or fixed via environment variable). The resulting token data can be shared with or consumed by another system.

### Requirements

- Node.js (any modern LTS is fine)
- `pnpm` installed globally

### Install dependencies

```bash
pnpm install
```

### Generate a JWT (default HS256 / shared secret)

This will print a JSON object with the random subject, issuer, JWT token, algorithm, secret, and the fully decoded token (header, payload, and signature). By default the token expires after 1 hour, but this is configurable. If `JWT_ISSUER` is set, it will override the default issuer (`jwt-generator`). If `JWT_AUDIENCE` is set, the audience will also be included. You can also inject additional custom claims by setting `JWT_CUSTOM_CLAIMS` to a JSON object string.

```bash
pnpm start
# or
pnpm run generate
```

Example output:

```json
{
  "subject": "randomSubjectIdHere",
  "issuer": "jwt-generator",
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
      "iss": "jwt-generator",
      "exp": 1700003600
    },
    "signature": "abc123signature"
  }
}
```

### Configuring the shared secret
By default the secret is `changeme-secret` and the issuer is `jwt-generator`. To use a custom shared secret (for example, one agreed with another system that will verify the JWT), set the `JWT_SECRET` environment variable. To override the issuer, set `JWT_ISSUER`:

```bash
JWT_SECRET="my-shared-secret" JWT_ISSUER="my-issuer" pnpm start
```

The other system should verify the token using:

- `HS256` algorithm
- the same shared secret (`JWT_SECRET`)

### Using a .env file

This project automatically loads a `.env` file in the project root (via `dotenv`) so you don’t have to prefix every command with environment variables.

You can optionally fix the subject claim instead of using a random value by setting `JWT_SUBJECT`.

1. For HS256 (shared secret), create a `.env` file:

   ```bash
   echo 'JWT_ALG=HS256' >> .env
   echo 'JWT_ISSUER=my-issuer' >> .env
    echo 'JWT_SECRET=my-shared-secret' >> .env
    # Optional: set a fixed subject claim
    echo 'JWT_SUBJECT=my-subject' >> .env
    # Optional: set an audience claim
    echo 'JWT_AUDIENCE=my-audience' >> .env
    # Optional: set additional custom claims (as JSON)
    echo 'JWT_CUSTOM_CLAIMS={"role":"admin","env":"test"}' >> .env
    # Optional: configure token lifetime (default: 1h)
    # Supports jsonwebtoken "expiresIn" syntax, e.g. 600, 10m, 2h, 1d
    echo 'JWT_EXPIRES_IN=1h' >> .env
   ```

2. For RS256, you can also configure everything in `.env`:

   ```bash
   echo 'JWT_ALG=RS256' >> .env
   echo 'JWT_PRIVATE_KEY_FILE=./jwt-private.pem' >> .env
    echo 'JWT_CERT_FILE=./jwt-cert.pem' >> .env
    # Optional: set a fixed subject claim
    echo 'JWT_SUBJECT=my-subject' >> .env
    # Optional: set an audience claim
    echo 'JWT_AUDIENCE=my-audience' >> .env
    # Optional: set additional custom claims (as JSON)
    echo 'JWT_CUSTOM_CLAIMS={"role":"admin","tier":"gold"}' >> .env
    # Optional: configure token lifetime (default: 1h)
    # Supports jsonwebtoken "expiresIn" syntax, e.g. 600, 10m, 2h, 1d
    echo 'JWT_EXPIRES_IN=1h' >> .env
   ```

Then simply run:

```bash
pnpm start
```

### Custom claims via `JWT_CUSTOM_CLAIMS`

You can attach arbitrary additional claims to the JWT payload by setting the `JWT_CUSTOM_CLAIMS` environment variable to a JSON object string. For example:

```bash
JWT_CUSTOM_CLAIMS='{"role":"admin","env":"test"}' pnpm start
```

Those keys will be merged into the payload alongside the standard claims (`sub`, `iat`, `iss`, and optional `aud`). Reserved claims from this tool are not overridden by `JWT_CUSTOM_CLAIMS`. If the value cannot be parsed as a JSON object, an error is printed and the token is generated without those custom claims.

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
