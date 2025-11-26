import {
  ArgumentMetadata,
  BadGatewayException,
  PipeTransform,
} from '@nestjs/common'
import { ZodError, ZodType } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError)
        throw new BadGatewayException({
          message: 'Validation failed',
          statusCode: 400,
          errors: fromZodError(error),
        })

      throw new BadGatewayException('Validation failed')
    }
    return value
  }
}
