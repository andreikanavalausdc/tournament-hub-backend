import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { CommonResponseRTO } from '../rto/common-response.rto';

type ApiResponseOptions = {
  isArray?: boolean;
  primitive?: 'string' | 'number' | 'boolean';
  isPaginated?: boolean;
};

export function ApiResponse(
  status: HttpStatus,
  model: Type<unknown>,
  options: ApiResponseOptions = {},
): MethodDecorator {
  const { isArray = false, primitive, isPaginated } = options;

  const extraModels = primitive ? [CommonResponseRTO] : [CommonResponseRTO, model];

  const primitiveSchema = primitive ? { type: primitive } : { $ref: getSchemaPath(model) };

  const arraySchema = {
    type: 'array',
    items: primitiveSchema,
  };

  const dataSchema = isPaginated
    ? {
        type: 'object',
        properties: {
          items: arraySchema,
          totalCount: { type: 'number', example: 125 },
        },
        required: ['items', 'totalCount'],
      }
    : isArray
      ? arraySchema
      : primitiveSchema;

  const schema = {
    allOf: [
      { $ref: getSchemaPath(CommonResponseRTO) },
      {
        properties: {
          data: dataSchema,
        },
      },
    ],
  };

  return applyDecorators(
    ApiExtraModels(...extraModels),
    status === HttpStatus.OK ? ApiOkResponse({ schema }) : ApiCreatedResponse({ schema }),
  );
}
