import { Bucket } from '@google-cloud/storage'
import { Logger } from '@nestjs/common'
import { extname } from 'path'

export class BucketSharedService {
  private bucket: Bucket
  private logger: Logger

  constructor(bucket: Bucket, logName?: string) {
    this.bucket = bucket
    this.logger = new Logger(`${BucketSharedService.name}_${logName}`)
  }

  public async isFileExists(name: string) {
    try {
      const fileName = name
      const file = this.bucket.file(fileName)

      const [isExists] = await file.exists()

      return isExists
    } catch (error) {
      throw error
    }
  }

  public async deleteFileByName(path: string, folderPath: string) {
    return new Promise(async (resolve, reject) => {
      const pathes = path?.includes('%2F') ? path?.split('%2F') : path?.split('/')
      const fileName = pathes?.[pathes?.length - 1]
      const file = this.bucket.file(`${folderPath ? `${folderPath}/` : ''}${fileName}`)

      const [isExists] = await file.exists()

      if (!isExists) {
        reject(new Error('File does not exist'))
      }

      /**
       * Нет гарантий, что он наверняка удаляет, но вроде бы файлы становятся не доступными к поиску по их ссылкам
       */
      file
        .delete()
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          this.logger.error('Error with file bucket removing', err?.message)
          reject(err)
        })
    })
  }

  /**
   * Using with upload file
   */
  public async saveFileByUploadsFolder(definedFile: Express.Multer.File, folderPath?: string): Promise<string> {
    const uniqueSuffix = `${folderPath || 'main'}/${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const fileName = `${uniqueSuffix}${extname(definedFile.path)}`

    return new Promise((resolve, reject) => {
      this.bucket
        .upload(definedFile.path, {
          destination: fileName,
        })
        .then((response) => {
          const [uploadedFile] = response || []
          const file = this.bucket.file(uploadedFile?.metadata?.name)

          file.makePublic(async (err) => {
            if (err) {
              this.logger.error(`Error making file public: ${err}`)
              reject(err)
            } else {
              this.logger.log(`File ${file.name} is now public.`)
              const publicUrl = file.publicUrl()
              this.logger.log(`Public URL for ${file.name}: ${publicUrl}`)
              resolve(publicUrl)
            }
          })

          return true
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Using without multer storage option, only memory buffer
   */
  public async saveFileByUrlAndBuffer(path: string, folderPath: string, buffer: Buffer): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const uniqueSuffix = `${folderPath || 'main'}/${Date.now()}-${Math.round(Math.random() * 1e9)}`
      const fileName = `${uniqueSuffix}${extname(path)}`
      const file = this.bucket.file(fileName)
      await file.save(buffer)

      file.makePublic(async (err) => {
        if (err) {
          this.logger.error(`Error making file public: ${err}`)
          reject(err)
        } else {
          this.logger.log(`File ${file.name} is now public.`)
          const publicUrl = file.publicUrl()
          this.logger.log(`Public URL for ${file.name}: ${publicUrl}`)
          resolve(publicUrl)
        }
      })
    })
  }
}
