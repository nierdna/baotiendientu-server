import { PaginationResponse } from '@/shared/pagination/pagination.interface';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const ApiBaseResponse = <TModel extends Type<any>>(
  model?: TModel,
  options: {
    statusCode?: number;
    isArray?: boolean;
    isPaginate?: boolean;
    description?: string;
  } = {},
) => {
  const { statusCode, isArray, isPaginate, description } = options || {};
  const status = statusCode ? statusCode : 200;
  const extraModels: any[] = isPaginate ? [model, PaginationResponse] : [model];
  const buildDataProperty = () => {
    if (!model) {
      return isArray
        ? {
            type: 'array',
            items: { type: 'object' },
          }
        : { type: 'object' };
    }
    return isArray
      ? {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        }
      : { $ref: getSchemaPath(model) };
  };

  const properties: (SchemaObject | ReferenceObject)[] = [
    {
      properties: {
        data: buildDataProperty(),
      },
    },
  ];

  if (isPaginate) {
    properties.push({
      properties: {
        pagination: { $ref: getSchemaPath(PaginationResponse) },
      },
    });
  }

  properties.push({
    properties: {
      status_code: { type: 'number', example: 200 },
      msg: { type: 'string', example: 'Success' },
    },
  });

  const filteredExtraModels = extraModels.filter(Boolean);

  return applyDecorators(
    ApiExtraModels(...filteredExtraModels),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: properties,
      },
    }),
  );
};
