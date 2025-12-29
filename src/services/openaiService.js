import { API_CONFIG, QUIZ_CONFIG } from '../config/api'

export class OpenAIService {
  constructor() {
    this.apiKey = API_CONFIG.OPENAI_API_KEY
    this.apiUrl = API_CONFIG.OPENAI_API_URL
    this.model = API_CONFIG.OPENAI_MODEL
  }

  /**
   * Generate quiz questions with increasing difficulty
   * @param {number} numQuestions - Total number of questions
   * @param {Array<string>} categories - Selected categories
   * @returns {Promise<Array>} Array of questions
   */
  async generateQuizQuestions(numQuestions = 10, categories = []) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file')
    }

    const difficultiesPerQuestion = this.calculateDifficultyProgression(numQuestions)
    const categoriesStr = categories.length > 0 ? categories.join(', ') : 'cultura generale'

    const prompt = `Genera esattamente ${numQuestions} domande di quiz in italiano con difficoltà crescente.

Categorie: ${categoriesStr}

Difficoltà per ogni domanda:
${difficultiesPerQuestion.map((d, i) => `Domanda ${i + 1}: ${d}`).join('\n')}

IMPORTANTE:
- Le prime domande devono essere FACILI
- Le ultime domande devono essere MOLTO DIFFICILI (livello esperto)
- Ogni domanda deve avere 4 opzioni di risposta
- Una sola risposta corretta
- Le opzioni devono essere plausibili
- Aggiungi una breve spiegazione della risposta corretta

Rispondi SOLO con un JSON array valido in questo formato:
[
  {
    "question": "Testo della domanda",
    "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
    "correctAnswer": 0,
    "difficulty": "facile",
    "category": "Storia",
    "explanation": "Spiegazione della risposta"
  }
]

NON aggiungere testo prima o dopo il JSON.`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Sei un esperto creatore di quiz educativi. Generi domande accurate, interessanti e con difficoltà appropriata. Rispondi SOLO con JSON valido, senza testo aggiuntivo.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content.trim()
      
      // Parse JSON from response
      let questions
      try {
        // Remove markdown code blocks if present
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
        questions = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error('Failed to parse JSON:', content)
        throw new Error('Failed to parse quiz questions from API response')
      }

      // Validate questions
      if (!Array.isArray(questions) || questions.length !== numQuestions) {
        throw new Error('Invalid number of questions received')
      }

      return questions
    } catch (error) {
      console.error('Error generating quiz:', error)
      throw error
    }
  }

  /**
   * Calculate difficulty progression for questions
   * @param {number} numQuestions 
   * @returns {Array<string>}
   */
  calculateDifficultyProgression(numQuestions) {
    const difficulties = QUIZ_CONFIG.DIFFICULTY_LEVELS
    const progression = []

    for (let i = 0; i < numQuestions; i++) {
      const ratio = i / (numQuestions - 1)
      const index = Math.floor(ratio * (difficulties.length - 1))
      progression.push(difficulties[index])
    }

    return progression
  }

  /**
   * Validate API key
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey.length > 0
  }
}

export default new OpenAIService()

