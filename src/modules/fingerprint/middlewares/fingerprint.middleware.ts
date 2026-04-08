import { ServerResponse } from 'node:http';

import { Injectable, NestMiddleware } from '@nestjs/common';

import { FingerprintService } from '../services/fingerprint.service';
import { FingerprintRequest } from '../types/fingerprint-request.type';

@Injectable()
export class FingerprintMiddleware implements NestMiddleware {
  constructor(private readonly fingerprintService: FingerprintService) {}

  use(req: FingerprintRequest, res: ServerResponse, next: () => void): void {
    req.fp = this.fingerprintService.getOrCreateFingerprint(req, res, `localhost`);

    next();
  }
}
