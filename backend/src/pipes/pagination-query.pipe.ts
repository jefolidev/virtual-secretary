import { pageQueryParamSchema } from '@/controllers/dto/page-query.dto'
import { ZodValidationPipe } from './zod-validation.pipe'

export const PaginationQueryPipe = new ZodValidationPipe(pageQueryParamSchema)
