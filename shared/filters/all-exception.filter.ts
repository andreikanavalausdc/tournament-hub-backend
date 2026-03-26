import { HttpStatusReverse } from '@shared/constants/http-status-reverse.constant';
import { getExceptionWithArgs } from '@shared/helpers/get-exception-with-args.helper';
import { CommonResponseRTO } from '@shared/rto/common-response.rto';
import { isObject } from '@shared/utils/is-object.util';
import { isStringArray } from '@shared/utils/is-string-array.util';
import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isJSON, isString } from 'class-validator';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import {
  EntityNotFoundError,
  EntityPropertyNotFoundError,
  FindRelationsNotFoundError,
  PrimaryColumnCannotBeNullableError,
  TypeORMError,
} from 'typeorm';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  public override catch(exception: HttpException, host: ArgumentsHost): void {
    const i18n = I18nContext.current(host) ?? undefined;

    const status = this.getStatusCode(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.isHttpException(exception) ? exception.getResponse() : undefined;

    const data: null = null;
    const error = this.extractError(errorResponse) ?? HttpStatusReverse[status] ?? 'Error';

    const message = this.normalizeToArray(this.getMessage(exception, i18n));

    const answer: CommonResponseRTO<null> = {
      code: status,
      message,
      data,
      error,
    };

    response.status(status).json(answer);
  }

  private getTypeOrmStatusCode(exception: TypeORMError): HttpStatus {
    if (exception instanceof EntityNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }

    if (
      exception instanceof FindRelationsNotFoundError ||
      exception instanceof EntityPropertyNotFoundError ||
      exception instanceof PrimaryColumnCannotBeNullableError
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getStatusCode(exception: unknown): HttpStatus {
    if (this.isHttpException(exception)) {
      return exception.getStatus();
    }

    if (this.isTypeORMError(exception)) {
      return this.getTypeOrmStatusCode(exception);
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown, i18n?: I18nContext): string | string[] {
    if (this.isHttpException(exception)) {
      const response = exception.getResponse();

      if (isString(response)) {
        return this.parseAndTranslate(response, i18n);
      }

      if (isObject(response)) {
        const msg = (response as { message?: unknown }).message;
        if (isString(msg) || isStringArray(msg)) {
          return this.parseAndTranslate(msg, i18n);
        }
      }

      return this.parseAndTranslate(exception.message, i18n);
    }

    if (this.isTypeORMError(exception)) {
      return this.parseAndTranslate(this.getTypeormErrorMessage(exception), i18n);
    }

    if (this.isError(exception) && exception.message.length) {
      return this.parseAndTranslate(exception.message, i18n);
    }

    return this.parseAndTranslate('typeorm.UNEXPECTED', i18n);
  }

  private safeTranslate(key: string, i18n: I18nContext | undefined, args?: Record<string, unknown>): string {
    if (!i18n) {
      return key;
    }
    const translated = i18n.t(key, { args });
    return typeof translated === 'string' ? translated : key;
  }

  private parseAndTranslate(message: string | string[] | undefined, i18n?: I18nContext): string | string[] {
    if (Array.isArray(message)) {
      return message.map((msg) => this.parseSingleMessage(msg, i18n));
    }

    if (typeof message === 'string') {
      return this.parseSingleMessage(message, i18n);
    }

    return this.safeTranslate('typeorm.UNEXPECTED', i18n);
  }

  private parseSingleMessage(text: string, i18n?: I18nContext): string {
    if (isJSON(text)) {
      try {
        const { key, args } = JSON.parse(text);
        return this.safeTranslate(key, i18n, args);
      } catch {
        return text;
      }
    }

    return this.safeTranslate(text, i18n);
  }

  private normalizeToArray(message: string | string[]): string[] {
    return Array.isArray(message) ? message : [message];
  }

  private hasKey<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
    return typeof obj === 'object' && obj !== null && key in obj;
  }

  private extractError(errorResponse: unknown): string | null {
    if (this.hasKey(errorResponse, 'error')) {
      const value = errorResponse['error'];
      return typeof value === 'string' && value.length ? value : null;
    }

    return null;
  }

  private isHttpException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }

  private isTypeORMError(exception: unknown): exception is TypeORMError {
    return exception instanceof TypeORMError;
  }

  private isError(exception: unknown): exception is Error {
    return exception instanceof Error;
  }

  private getTypeormErrorMessage(exception: TypeORMError): string {
    if (exception instanceof EntityNotFoundError) {
      return getExceptionWithArgs('typeorm.TYPEORM_ENTITY_NOT_FOUND', { criteria: JSON.stringify(exception.criteria) });
    }

    if (this.isError(exception) && exception.message.length) {
      return exception.message;
    }

    return 'typeorm.UNEXPECTED';
  }
}
