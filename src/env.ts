const ENV = process.env.NODE_ENV

export const isDevelop = ENV === 'development'
export const isProduction = ENV === 'production'

export const getEnvFile = () => {
  if (isDevelop) {
    return '.env.dev'
  }

  return '.env'
}
