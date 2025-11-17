/**
 * Environment Configuration
 *
 * Centralized configuration management with environment-specific settings
 */

export type Environment = 'development' | 'production'

export interface EnvConfig {
  env: Environment
  isDevelopment: boolean
  isProduction: boolean
  zendesk: {
    apiUrl: string
    apiToken: string
    email?: string
    useProxy: boolean
    proxyPath: string
    fieldMap: Record<string, Record<string, number>>
  }
  supabase: {
    url: string
    anonKey: string
  }
}

/**
 * Get the current environment
 */
function getCurrentEnvironment(): Environment {
  const envVar = import.meta.env.VITE_ENV as string | undefined
  const mode = import.meta.env.MODE as string

  // Priority: VITE_ENV > MODE > default to development
  if (envVar === 'production' || mode === 'production') {
    return 'production'
  }
  return 'development'
}

/**
 * Get Zendesk configuration based on environment
 */
function getZendeskConfig(env: Environment): { apiUrl: string; apiToken: string; email?: string; useProxy: boolean; proxyPath: string; fieldMap: Record<string, Record<string, number>> } {
  if (env === 'production') {
    const apiUrl = (import.meta.env.VITE_ZENDESK_PROD_API_URL as string | undefined) || 'https://veoride.zendesk.com'
    const apiToken = (import.meta.env.VITE_ZENDESK_PROD_API_TOKEN as string | undefined) || ''
    const email = (import.meta.env.VITE_ZENDESK_PROD_EMAIL as string | undefined) || undefined
    const useProxyRaw = import.meta.env.VITE_ZENDESK_PROD_USE_PROXY as string | undefined
    const useProxy = useProxyRaw ? useProxyRaw === 'true' : true
    const proxyPath = (import.meta.env.VITE_ZENDESK_PROD_PROXY_PATH as string | undefined) || '/zendesk'
    const rawMap = (import.meta.env.VITE_ZENDESK_PROD_FIELD_MAP as string | undefined) || '{}'
    let fieldMap: Record<string, Record<string, number>> = {}
    try { fieldMap = JSON.parse(rawMap) } catch { fieldMap = {} }
    return { apiUrl, apiToken, email, useProxy, proxyPath, fieldMap }
  }

  const apiUrl = (import.meta.env.VITE_ZENDESK_DEV_API_URL as string | undefined) || 'https://d3v-greenzonesupporthelp.zendesk.com'
  const apiToken = (import.meta.env.VITE_ZENDESK_DEV_API_TOKEN as string | undefined) || ''
  const email = (import.meta.env.VITE_ZENDESK_DEV_EMAIL as string | undefined) || undefined
  const useProxyRaw = import.meta.env.VITE_ZENDESK_DEV_USE_PROXY as string | undefined
  const useProxy = useProxyRaw ? useProxyRaw === 'true' : true
  const proxyPath = (import.meta.env.VITE_ZENDESK_DEV_PROXY_PATH as string | undefined) || '/zendesk'
  const rawMap = (import.meta.env.VITE_ZENDESK_DEV_FIELD_MAP as string | undefined) || '{}'
  let fieldMap: Record<string, Record<string, number>> = {}
  try { fieldMap = JSON.parse(rawMap) } catch { fieldMap = {} }
  return { apiUrl, apiToken, email, useProxy, proxyPath, fieldMap }
}

/**
 * Get Supabase configuration
 */
function getSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }
}

/**
 * Create and export environment configuration
 */
function createEnvConfig(): EnvConfig {
  const env = getCurrentEnvironment()

  return {
    env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    zendesk: getZendeskConfig(env),
    supabase: getSupabaseConfig(),
  }
}

export const envConfig = createEnvConfig()

// Log environment info in development
if (envConfig.isDevelopment) {
  console.log('🔧 Environment:', envConfig.env)
  console.log('📍 Zendesk API:', envConfig.zendesk.apiUrl)
  console.log('🔒 Zendesk useProxy:', envConfig.zendesk.useProxy)
  console.log('🧭 FieldMap slugs:', Object.keys(envConfig.zendesk.fieldMap || {}))
  console.log('🗄️  Supabase:', envConfig.supabase.url)
}
