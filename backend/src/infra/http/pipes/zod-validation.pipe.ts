import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common'
import { ZodError, ZodType } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      console.debug('[ZodValidationPipe] incoming value:', metadata.type, value)

      return this.schema.parse(value)
    } catch (error) {
      console.debug(
        '[ZodValidationPipe] validation error for value:',
        value,
        error
      )

      if (error instanceof ZodError)
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: fromZodError(error),
        })

      throw new BadRequestException('Validation failed')
    }
  }
}
