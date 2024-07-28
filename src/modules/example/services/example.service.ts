import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import * as fs from 'fs'
import { BucketProvider, BucketSharedService, DefaultBucketProvider } from 'src/providers'

import { ExampleFilter, ExampleRequestBody } from '../dto'
import { ExampleRepository } from '../repositories'

@Injectable()
export class ExampleService {
  private bucketService: BucketSharedService

  constructor(
    private readonly exampleRepository: ExampleRepository,
    @Inject(DefaultBucketProvider.bucketName)
    private readonly bucketProvider: BucketProvider,
  ) {
    this.bucketService = new BucketSharedService(this.bucketProvider.bucket, ExampleService.name)
  }

  public async getList(filter: ExampleFilter) {
    return this.exampleRepository.find(filter)
  }

  public async getItem(id: string) {
    return this.exampleRepository.getDataByDocumentId(id)
  }

  public async create(body: ExampleRequestBody) {
    return this.exampleRepository.create(body)
  }

  public async update(id: string, body: ExampleRequestBody) {
    const { doc, data } = await this.exampleRepository.getUpdate(id)

    if (!doc || !data) {
      throw new NotFoundException('Example document does not exist')
    }

    const response = this.exampleRepository.getValidProperties({ ...data, ...body }, true)
    const changedKeys = Object.keys(body)
    const valuesToUpdate: Partial<ExampleRequestBody> = {}

    for (const key of changedKeys) {
      const newValue = response?.[key]
      const currentValue = doc?.[key]

      if (newValue !== currentValue) {
        valuesToUpdate[key] = newValue
      }
    }

    if (Object.keys(valuesToUpdate).length > 0) {
      await doc.update({ ...valuesToUpdate, updatedAt: response?.updatedAt })
    }

    return response
  }

  public async togglePublish(id: string) {
    const { doc, data } = await this.exampleRepository.getUpdate(id)

    if (!doc || !data) {
      throw new NotFoundException('Example document does not exist')
    }

    const newPublishedState = !data?.isPublished

    const response = this.exampleRepository.getValidProperties({ ...data, isPublished: newPublishedState }, true)

    await doc.update({ isPublished: newPublishedState, updatedAt: response?.updatedAt })

    return response
  }

  public async updateImage(id: string, file: Express.Multer.File) {
    try {
      const { doc, data } = await this.exampleRepository.getUpdate(id)

      if (!doc || !data) {
        throw new NotFoundException('Example document does not exist')
      }

      const imageUrl = await this.bucketService.saveFileByUploadsFolder(file, `example/${data?.id}`)

      try {
        /**
         * Try to remove previously file
         */
        await this.bucketService.deleteFileByName(data?.imageUrl, `example/${data?.id}`)
      } catch {}

      const response = this.exampleRepository.getValidProperties({ ...data, imageUrl }, true)

      await doc.update({ imageUrl, updatedAt: response?.updatedAt })

      /**
       * Need for deletion uploads/ file path
       */
      fs.unlinkSync(file.path)

      return response
    } catch (error) {
      /**
       * Need for deletion uploads/ file path
       */
      fs.unlinkSync(file.path)

      throw error
    }
  }
}
