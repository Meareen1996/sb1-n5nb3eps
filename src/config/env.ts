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
function getZendeskConfig(env: Environment): { apiUrl: string; apiToken: string } {
  if (env === 'production') {
    return {
      apiUrl: import.meta.env.VITE_ZENDESK_PROD_API_URL || '',
      apiToken: import.meta.env.VITE_ZENDESK_PROD_API_TOKEN || '',
    }
  }

  return {
    apiUrl: import.meta.env.VITE_ZENDESK_DEV_API_URL || '',
    apiToken: import.meta.env.VITE_ZENDESK_DEV_API_TOKEN || '',
  }
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
  console.log('🗄️  Supabase:', envConfig.supabase.url)
}
