import { ServerResponse } from 'node:http';

import { Injectable, NestMiddleware } from '@nestjs/common';

import { FingerprintService } from '../services/fingerprint.service';
import { FingerprintRequest } from '../types/fingerprint-request.type';

@Injectable()
export class FingerprintMiddleware implements NestMiddleware {
  constructor(private readonly fingerprintService: FingerprintService) {}

  use(req: FingerprintRequest, res: ServerResponse, next: () => void): void {
    const domain = req.hostname.split('.').slice(-2).join('.');

    req.fp = this.fingerprintService.getOrCreateFingerprint(req, res, `.${domain}`);

    next();
  }
}
