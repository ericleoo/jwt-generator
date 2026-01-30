#!/usr/bin/env node

const fs = require('fs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
require('dotenv').config();

function generateJwt() {
  const subject = process.env.JWT_SUBJECT || nanoid();
  const issuer = process.env.JWT_ISSUER || 'jwt-generator';
  const audience = process.env.JWT_AUDIENCE;
  const customClaimsRaw = process.env.JWT_CUSTOM_CLAIMS;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  // Choose algorithm: HS256 (shared secret) or RS256 (private key + X.509 cert)
  const algorithm = process.env.JWT_ALG || 'HS256';

  let signingKey;
  const meta = {};

  if (algorithm === 'HS256') {
    const secret = process.env.JWT_SECRET || 'changeme-secret';
    signingKey = secret;
    meta.secret = secret;
    meta.keyType = 'symmetric';
  } else if (algorithm === 'RS256') {
    const privateKeyFile = process.env.JWT_PRIVATE_KEY_FILE;
    if (!privateKeyFile) {
      throw new Error('JWT_PRIVATE_KEY_FILE is required when JWT_ALG=RS256');
    }

    signingKey = fs.readFileSync(privateKeyFile, 'utf8');
    meta.privateKeyFile = privateKeyFile;
    meta.keyType = 'asymmetric';

    const certFile = process.env.JWT_CERT_FILE;
    if (certFile) {
      meta.certificateFile = certFile;
      meta.certificate = fs.readFileSync(certFile, 'utf8');
    }
  } else {
    throw new Error(`Unsupported JWT_ALG: ${algorithm}`);
  }

  const payload = {};

  // Attach any custom claims first so reserved claims below cannot be overridden.
  if (customClaimsRaw) {
    try {
      const customClaims = JSON.parse(customClaimsRaw);
      if (customClaims && typeof customClaims === 'object' && !Array.isArray(customClaims)) {
        Object.assign(payload, customClaims);
      } else {
        console.error('JWT_CUSTOM_CLAIMS must be a JSON object');
      }
    } catch (err) {
      console.error(`Failed to parse JWT_CUSTOM_CLAIMS: ${err.message}`);
    }
  }

  payload.sub = subject;
  payload.iat = Math.floor(Date.now() / 1000);
  payload.iss = issuer;

  if (audience) {
    payload.aud = audience;
  }

  const token = jwt.sign(payload, signingKey, {
    algorithm,
    expiresIn,
  });

  const decoded = jwt.decode(token, { complete: true });

  const result = {
    token,
    subject,
    issuer,
    algorithm,
    decoded,
    ...meta,
  };

  if (audience) {
    result.audience = audience;
  }

  return result;
}

function main() {
  const payload = generateJwt();

  // Output in a simple, machine-readable JSON format so another system
  // can easily consume it.

  // Pretty-print JSON to stdout
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { generateJwt };
