#!/usr/bin/env node

const fs = require('fs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
require('dotenv').config();

function generateJwt() {
  const subject = nanoid();

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

  const token = jwt.sign(
    {
      sub: subject,
      iat: Math.floor(Date.now() / 1000),
    },
    signingKey,
    {
      algorithm,
      expiresIn: '1h',
    },
  );

  const decoded = jwt.decode(token, { complete: true });

  return {
    token,
    subject,
    algorithm,
    decoded,
    ...meta,
  };
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
