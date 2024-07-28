import { Module } from '@nestjs/common'

import { ExampleController } from './controllers'
import { ExampleDocument } from './entities'
import { ExampleRepository } from './repositories'
import { ExampleService } from './services'

@Module({
  imports: [],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleDocument, ExampleRepository],
  exports: [ExampleService, ExampleRepository],
})
/**
 * Данный модуль предназначен в качестве примера организации структуры кода и работы с Firestore
 */
export class ExampleModule {}
