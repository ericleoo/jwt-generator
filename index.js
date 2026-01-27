#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

function generateJwt() {
  const subject = nanoid();

  // In a real system you’d likely want to load this from an environment variable
  // or config file. For this simple tool we generate it once at process start.
  const secret = process.env.JWT_SECRET || 'changeme-secret';

  const token = jwt.sign(
    {
      sub: subject,
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '1h',
    },
  );

  const decoded = jwt.decode(token, { complete: true });

  return { token, subject, secret, decoded };
}

function main() {
  const { token, subject, secret, decoded } = generateJwt();

  // Output in a simple, machine-readable JSON format so another system
  // can easily consume it.
  const payload = {
    subject,
    token,
    algorithm: 'HS256',
    secret,
    decoded,
  };

  // Pretty-print JSON to stdout
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { generateJwt };
