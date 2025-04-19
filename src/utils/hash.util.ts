import * as crypto from 'crypto';

export function getHash(input: string): number {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return parseInt(hash.substring(0, 8), 16); // Take first 8 hex digits → number
}
