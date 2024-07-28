import { Firestore } from '@google-cloud/firestore'
import { DynamicModule, Module } from '@nestjs/common'

import {
  FirestoreCollectionProviders,
  FirestoreDatabaseProvider,
  FirestoreOptionsProvider,
} from './firestore.providers'
import { FirestoreModuleOptions } from './types'

@Module({})
export class FirestoreModule {
  static forRoot(options: FirestoreModuleOptions): DynamicModule {
    const collectionProviders = FirestoreCollectionProviders.map((providerName) => ({
      provide: providerName,
      useFactory: (db) => db.collection(providerName),
      inject: [FirestoreDatabaseProvider],
    }))

    const optionsProvider = {
      provide: FirestoreOptionsProvider,
      useFactory: options.useFactory,
      inject: options.inject,
    }

    const dbProvider = {
      provide: FirestoreDatabaseProvider,
      useFactory: (config) => new Firestore(config),
      inject: [FirestoreOptionsProvider],
    }

    return {
      global: true,
      module: FirestoreModule,
      imports: options.imports,
      providers: [optionsProvider, dbProvider, ...collectionProviders],
      exports: [dbProvider, ...collectionProviders],
    }
  }
}
