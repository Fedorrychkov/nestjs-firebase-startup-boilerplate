import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { getFileTypesRegexp, IMG_MAX_1MB_SIZE_IN_BYTE, listPngAndJpegImageExt } from 'src/helpers'
import { storage } from 'src/providers'

import { ExampleRequestBody } from '../dto'
import { ExampleDocument } from '../entities'
import { ExampleService } from '../services'

@Controller('v1/example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('/')
  async getList(@Query('isPublished', ParseBoolPipe) isPublished?: boolean): Promise<ExampleDocument[]> {
    const response = await this.exampleService.getList({ isPublished })

    if (!response?.length) {
      throw new NotFoundException('Examples are not exist')
    }

    return response
  }

  @Get('/:id')
  async get(@Param('id') id: string): Promise<ExampleDocument> {
    const response = await this.exampleService.getItem(id)

    if (!response) {
      throw new NotFoundException('Example does not exist')
    }

    return response
  }

  @Post('/')
  async create(@Body() body: ExampleRequestBody): Promise<ExampleDocument> {
    return this.exampleService.create(body)
  }

  @Patch('/:id')
  async update(@Param('id') id: string, @Body() body: ExampleRequestBody): Promise<ExampleDocument> {
    return this.exampleService.update(id, body)
  }

  @Patch('/publish/:id')
  async togglePublish(@Param('id') id: string): Promise<ExampleDocument> {
    return this.exampleService.togglePublish(id)
  }

  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { files: 1 } }))
  async updateExampleImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: IMG_MAX_1MB_SIZE_IN_BYTE }),
          new FileTypeValidator({ fileType: getFileTypesRegexp(listPngAndJpegImageExt) }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<ExampleDocument> {
    return this.exampleService.updateImage(id, file)
  }
}
