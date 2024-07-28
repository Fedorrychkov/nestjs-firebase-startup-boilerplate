import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common'

import { ExampleFilter, ExampleRequestBody } from '../dto'
import { ExampleDocument } from '../entities'
import { ExampleService } from '../services'

@Controller('v1/example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('/')
  async getList(@Query() query?: ExampleFilter): Promise<ExampleDocument[]> {
    const response = await this.exampleService.getList(query)

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

  @Patch('/:id')
  async togglePublish(@Param('id') id: string): Promise<ExampleDocument> {
    return this.exampleService.togglePublish(id)
  }
}
