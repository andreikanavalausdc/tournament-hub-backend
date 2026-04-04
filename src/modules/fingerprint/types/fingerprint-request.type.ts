import { IncomingMessage } from 'node:http';

import { Fingerprint } from '../interfaces/fingerprint.interface';

export type FingerprintRequest = IncomingMessage & {
  cookies: Record<string, string>;
  hostname: string;
  fp?: Fingerprint;
};
