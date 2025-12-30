import { API_CONFIG } from '../config/api'

/**
 * Base service for OpenAI API calls
 * Shared configuration and utilities for all game services
 */
export class BaseOpenAIService {
  constructor() {
    this.apiKey = API_CONFIG.OPENAI_API_KEY
    this.apiUrl = API_CONFIG.OPENAI_API_URL
    this.model = API_CONFIG.OPENAI_MODEL
  }

  /**
   * Check if OpenAI API is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey
  }

  /**
   * Make API call to OpenAI
   * @param {string} systemPrompt - System instructions
   * @param {string} userPrompt - User message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  async makeAPICall(systemPrompt, userPrompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file')
    }

    const {
      temperature = 0.8,
      maxTokens = 500,
      responseFormat = null
    } = options

    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens
    }

    if (responseFormat) {
      body.response_format = responseFormat
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }
}

