import { envConfig } from './env'

export function mapCustomFields(params: { slug?: string; formId?: number | string }, fields: Record<string, any>): Array<{ id: number; value: any }> {
  const slug = params.slug || ''
  const map = envConfig.zendesk.fieldMap[slug] || {}
  const result: Array<{ id: number; value: any }> = []
  Object.entries(fields).forEach(([key, value]) => {
    if (key === 'subject' || key === 'description') return
    const id = map[key]
    if (typeof id === 'number' && Number.isFinite(id)) {
      result.push({ id, value })
    }
  })
  return result
}