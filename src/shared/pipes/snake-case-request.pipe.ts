import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { snakeCase } from 'lodash';

function toSnakeCaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCaseKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = snakeCase(key);
      result[snakeKey] = toSnakeCaseKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

@Injectable()
export class SnakeCaseRequestPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;
    return toSnakeCaseKeys(value);
  }
} 