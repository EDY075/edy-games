import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const privatePaths = { test(file) {
  const parts = file.split('/');
  const base = parts.at(-1);
  return ['private', 'marketing', 'archive'].includes(parts[0]) || base === '.env' || base.startsWith('.env.') || /\.(?:pem|key|bundle|zip)$/i.test(base) || ['docs/continuity.md', 'docs/agent-work.md'].includes(file);
} };
const privateContent = [
  /instagram\.com\/p\//i,
  /linkedin\.com\/feed\/update\//i,
  /business\.facebook\.com/i,
  /(?:[A-Z]:[\\/]Users[\\/]|authwall\?)/i,
  /(?:ghp_|gho_|ghu_|ghs_|github_pat_)[A-Za-z0-9_]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const failures = [];
for (const file of files) {
  if (privatePaths.test(file)) { failures.push(file + ': private artifact'); continue; }
  if (!/\.(?:md|json|mjs|js|css|html|txt|toml|ya?ml)$/.test(file)) continue;
  // Compressed media payloads are binary data, not source text.
  const text = (await fs.readFile(path.resolve(file), 'utf8')).replace(/data:[^"'\s()]+;base64,[A-Za-z0-9+/=\r\n]+/g, '[embedded-media]');
  if (privateContent.some(pattern => pattern.test(text))) failures.push(file + ': private marker');
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Public content guard passed: ' + files.length + ' tracked files.');
