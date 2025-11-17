/**
 * Zendesk API Service
 *
 * Handles all communication with Zendesk API for fetching ticket forms
 * and submitting support requests.
 *
 * Supports both development and production Zendesk environments.
 */

import { envConfig } from '../config/env'
import { mapCustomFields } from '../config/zendeskMapping'

export interface ZendeskField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'number' | 'date' | 'file'
  title: string
  description?: string
  required: boolean
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  conditionalLogic?: {
    showWhen: {
      fieldId: string
      value: string | string[]
    }
  }
}

export interface ZendeskTicketForm {
  id: string
  name: string
  fields: ZendeskField[]
  active: boolean
  position: number
}

export interface ZendeskSubmission {
  formId?: string | number
  slug?: string
  fields: Record<string, any>
  attachments?: Array<{
    filename: string
    contentType: string
    data: string // base64
  }>
}

class ZendeskService {
  private apiUrl: string
  private apiToken: string
  private env: 'development' | 'production'
  private email?: string
  private useProxy: boolean
  private baseUrl: string

  constructor() {
    // Get environment-specific Zendesk configuration
    this.env = envConfig.env
    this.apiUrl = envConfig.zendesk.apiUrl
    this.apiToken = envConfig.zendesk.apiToken
    this.email = envConfig.zendesk.email
    this.useProxy = (envConfig as any).zendesk.useProxy ?? false
    this.baseUrl = this.useProxy ? (envConfig as any).zendesk.proxyPath : this.apiUrl

    if (envConfig.isDevelopment) {
      console.log('🎫 Zendesk Service initialized')
      console.log('   Environment:', this.env)
      console.log('   API URL:', this.apiUrl)
      console.log('   UseProxy:', this.useProxy)
      console.log('   BaseURL:', this.baseUrl)
      console.log('   Email set:', !!this.email)
    }
  }

  /**
   * Get current environment
   */
  getEnvironment() {
    return this.env
  }

  /**
   * Fetch all available ticket forms from Zendesk
   */
  async getTicketForms(): Promise<ZendeskTicketForm[]> {
    // If no API URL configured and not using proxy, return mock data
    if ((!this.apiUrl || !this.apiToken) && !this.useProxy) {
      console.warn('⚠️  Zendesk API not configured, using mock data')
      return this.getMockTicketForms()
    }

    try {
      if (envConfig.isDevelopment) {
        console.log('📡 Fetching ticket forms from Zendesk...')
        console.log('   Endpoint:', `${this.baseUrl}/api/v2/ticket_forms`)
        console.log('   Auth:', this.authInfo())
      }

      const response = await fetch(`${this.baseUrl}/api/v2/ticket_forms`, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        console.error('❌ Fetch ticket forms failed:', response.status, response.statusText)
        if (body) console.error('   Body:', body)
        throw new Error(`Failed to fetch ticket forms: ${response.statusText}`)
      }

      const data = await response.json()
      const forms = this.transformTicketForms(data.ticket_forms)

      if (envConfig.isDevelopment) {
        console.log('✅ Loaded', forms.length, 'ticket forms')
      }

      return forms
    } catch (error) {
      console.error('❌ Error fetching ticket forms:', error)
      console.warn('⚠️  Falling back to mock data')
      // Return mock data as fallback
      return this.getMockTicketForms()
    }
  }

  /**
   * Submit a support ticket to Zendesk
   */
  async submitTicket(submission: ZendeskSubmission): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    // If no API configured and not using proxy, return error
    if ((!this.apiUrl || !this.apiToken) && !this.useProxy) {
      console.warn('⚠️  Zendesk API not configured')
      return {
        success: false,
        error: 'Zendesk API not configured',
      }
    }

    try {
      if (envConfig.isDevelopment) {
        console.log('📤 Submitting ticket to Zendesk...')
        console.log('   Environment:', this.env)
        console.log('   Endpoint:', `${this.baseUrl}/api/v2/tickets.json`)
        console.log('   Auth:', this.authInfo())
      }

      const formIdNumber = typeof submission.formId === 'number' ? submission.formId : Number(submission.formId)
      const payload: any = {
        request: {
          subject: submission.fields.subject || 'Support Request',
          comment: {
            body: submission.fields.description || '',
            uploads: submission.attachments?.map(att => att.data) || [],
          },
          custom_fields: mapCustomFields({ slug: submission.slug, formId: submission.formId }, submission.fields),
        },
      }
      if (Number.isFinite(formIdNumber)) {
        payload.request.ticket_form_id = formIdNumber
      }

      const ticketPayload: any = {
        ticket: {
          subject: payload.request.subject,
          comment: {
            body: payload.request.comment.body,
          },
          custom_fields: payload.request.custom_fields,
        },
      }
      if (Number.isFinite(formIdNumber)) {
        ticketPayload.ticket.ticket_form_id = formIdNumber
      }

      const response = await fetch(`${this.baseUrl}/api/v2/tickets.json`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(ticketPayload),
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        console.error('❌ Submit ticket failed:', response.status, response.statusText)
        if (body) console.error('   Body:', body)
        if (response.status === 401) {
          console.error('   Hint: verify email/token pair and Basic auth format (email/token:<API_TOKEN>)')
        }
        throw new Error(`Failed to submit ticket: ${response.statusText}`)
      }

      const data = await response.json()

      if (envConfig.isDevelopment) {
        console.log('✅ Ticket submitted successfully')
        console.log('Ticket ID:', data.request.id)
      }

      return {
        success: true,
        ticketId: data.request.id,
      }
    } catch (error) {
      console.error('❌ Error submitting ticket:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private getAuthHeader(): Record<string, string> {
    if (this.email && this.apiToken) {
      const token = btoa(`${this.email}/token:${this.apiToken}`)
      return { Authorization: `Basic ${token}` }
    }
    if (this.apiToken) {
      return { Authorization: `Bearer ${this.apiToken}` }
    }
    return {}
  }

  /**
   * Transform Zendesk API response to our internal format
   */
  private transformTicketForms(zendeskForms: any[]): ZendeskTicketForm[] {
    return zendeskForms
      .filter(form => form.active)
      .map(form => ({
        id: form.id.toString(),
        name: form.name,
        active: form.active,
        position: form.position,
        fields: form.ticket_field_ids.map((fieldId: string) =>
          this.transformField(form.fields?.find((f: any) => f.id === fieldId))
        ).filter(Boolean),
      }))
      .sort((a, b) => a.position - b.position)
  }

  /**
   * Transform a single Zendesk field to our internal format
   */
  private transformField(zendeskField: any): ZendeskField | null {
    if (!zendeskField) return null

    return {
      id: zendeskField.id.toString(),
      type: this.mapFieldType(zendeskField.type),
      title: zendeskField.title,
      description: zendeskField.description,
      required: zendeskField.required_in_portal || false,
      options: zendeskField.custom_field_options?.map((opt: any) => ({
        label: opt.name,
        value: opt.value,
      })),
      placeholder: zendeskField.title_in_portal,
    }
  }

  /**
   * Map Zendesk field types to our types
   */
  private mapFieldType(zendeskType: string): ZendeskField['type'] {
    const typeMap: Record<string, ZendeskField['type']> = {
      'text': 'text',
      'textarea': 'textarea',
      'dropdown': 'select',
      'multiselect': 'multiselect',
      'checkbox': 'checkbox',
      'tagger': 'select',
      'integer': 'number',
      'decimal': 'number',
      'date': 'date',
      'attachments': 'file',
    }
    return typeMap[zendeskType] || 'text'
  }

  /**
   * Mock data for development (based on design specs)
   */
  private getMockTicketForms(): ZendeskTicketForm[] {
    return [
      {
        id: 'ride-not-ended',
        name: "My ride hasn't ended.",
        active: true,
        position: 1,
        fields: [],
      },
      {
        id: 'vehicle-damaged',
        name: "The vehicle didn't move or was damaged.",
        active: true,
        position: 2,
        fields: [],
      },
      {
        id: 'charged-incorrectly',
        name: 'I was charged incorrectly.',
        active: true,
        position: 3,
        fields: [],
      },
      {
        id: 'delete-account',
        name: 'I want to delete my account.',
        active: true,
        position: 4,
        fields: [],
      },
      {
        id: 'id-verification',
        name: "My ID won't verify.",
        active: true,
        position: 5,
        fields: [],
      },
      {
        id: 'other',
        name: 'I have an issue not on the list.',
        active: true,
        position: 6,
        fields: [],
      },
    ]
  }

  private authInfo(): string {
    const h = this.getAuthHeader().Authorization
    if (!h) return 'none'
    if (h.startsWith('Basic ')) return 'Basic'
    if (h.startsWith('Bearer ')) return 'Bearer'
    return 'unknown'
  }
}

export const zendeskService = new ZendeskService()
