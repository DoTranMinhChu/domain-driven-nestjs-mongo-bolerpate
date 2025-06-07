import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
@Injectable()
export class ParseQueryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }
    const { metatype } = metadata;
    // Only process objects (DTO) coming from query
    if (
      !metatype ||
      ['String', 'Boolean', 'Number', 'Object', 'Array'].includes(metatype.name)
    ) {
      return value;
    }

    // Pre-parse string values in the raw query
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        const raw = value[key];
        if (typeof raw === 'string') {
          let parsed: any = raw;
          // Try JSON parse (for objects, arrays)
          try {
            parsed = JSON.parse(raw);
          } catch {
            // not JSON
            // Try number
            const num = Number(raw);
            if (!isNaN(num)) {
              parsed = num;
            } else if (raw === 'true' || raw === 'false') {
              parsed = raw === 'true';
            }
          }
          value[key] = parsed;
        }
      }
    }

    // Convert to DTO instance with implicit type conversion
    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(object as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return object;
  }
}
