import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as admin from 'firebase-admin'
import * as fs from 'fs'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService: ConfigService = app.get(ConfigService)
  const accountPath = configService.get<string>('SA_KEY')
  const serviceAccount: any = JSON.parse(fs.readFileSync(accountPath, 'utf8'))

  const adminConfig: admin.ServiceAccount = {
    projectId: serviceAccount.project_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
  }

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: `https://${adminConfig.projectId}.firebaseio.com`,
  })

  await app.listen(8080)
}

bootstrap()
