import { ServerResponse } from 'node:http';

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { FINGERPRINT_COOKIE_NAME, FINGERPRINT_MAX_AGE } from '../constants/fingerprint.constants';
import { Fingerprint } from '../interfaces/fingerprint.interface';
import { FingerprintRequest } from '../types/fingerprint-request.type';

@Injectable()
export class FingerprintService {
  getOrCreateFingerprint(req: FingerprintRequest, res: ServerResponse, domain: string): Fingerprint {
    let fp = req.cookies?.[FINGERPRINT_COOKIE_NAME];

    if (!fp) {
      fp = uuidv4();

      const cookie = `${FINGERPRINT_COOKIE_NAME}=${fp}; Path=/; HttpOnly; SameSite=Lax; Domain=${domain}; Max-Age=${FINGERPRINT_MAX_AGE}`;

      res.setHeader('Set-Cookie', cookie);
    }

    return { id: fp };
  }
}
