import { reduce } from 'lodash'

export const getFileTypesRegexp = (ext: string): string => reduce(ext.split(','), (acc, key) => `${acc}|${key}`)
