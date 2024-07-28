import { Timestamp } from '@google-cloud/firestore'

export class ExampleDocument {
  static collectionName = 'example'

  id: string
  title: string
  text?: string | null
  isPublished: boolean
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}
