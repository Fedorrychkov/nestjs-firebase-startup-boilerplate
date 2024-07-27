import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { getEnvFile } from './env'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFile(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
