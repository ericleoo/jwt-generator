## jwt-generator

Simple pnpm-based Node.js project that generates a JSON Web Token (JWT) with a random subject. The resulting token data can be shared with or consumed by another system.

### Requirements

- Node.js (any modern LTS is fine)
- `pnpm` installed globally

### Install dependencies

```bash
pnpm install
```

### Generate a JWT

This will print a JSON object with the random subject, JWT token, algorithm, and secret:

```bash
pnpm start
# or
pnpm run generate
```

Example output:

```json
{
  "subject": "randomSubjectIdHere",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "algorithm": "HS256",
  "secret": "changeme-secret"
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
