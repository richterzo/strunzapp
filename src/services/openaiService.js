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
    
    // Distribute questions across selected categories
    const categoryDistribution = this.distributeCategoriesAcrossQuestions(numQuestions, categories)

    const prompt = `Genera esattamente ${numQuestions} domande di quiz in italiano con difficoltà PROGRESSIVAMENTE CRESCENTE da PRINCIPIANTE a LEGGENDA.

CATEGORIE RICHIESTE: ${categoriesStr}

SCALA DIFFICOLTÀ (1-10):
${difficultiesPerQuestion.map((d, i) => {
  const cat = categoryDistribution[i] || 'cultura generale'
  return `Domanda ${i + 1}: Livello ${d.level}/10 - ${d.name.toUpperCase()} - Categoria: ${cat}`
}).join('\n')}

REGOLE FONDAMENTALI PER DIFFICOLTÀ:

Livello 1-2 (PRINCIPIANTE/FACILE):
- Conoscenze comuni e basilari
- Fatti universalmente noti
- Domande che tutti dovrebbero sapere
- Esempio: "Qual è la capitale d'Italia?"

Livello 3-4 (BASE/INTERMEDIO):
- Cultura generale di base
- Richiede un minimo di istruzione
- Fatti abbastanza noti
- Esempio: "In che anno è caduto il Muro di Berlino?"

Livello 5-6 (MEDIO/AVANZATO):
- Richiede cultura media-alta
- Dettagli specifici ma non oscuri
- Conoscenze settoriali
- Esempio: "Chi ha dipinto 'La Persistenza della Memoria'?"

Livello 7-8 (DIFFICILE/ESPERTO):
- Richiede conoscenze approfondite
- Dettagli specifici e date precise
- Fatti meno conosciuti
- Esempio: "In che anno è stata fondata l'UNESCO?"

Livello 9-10 (MAESTRO/LEGGENDA):
- Conoscenze molto specialistiche
- Dettagli oscuri e rari
- Richiede expertise nel campo
- Date precise, nomi completi
- Esempio: "Qual è il nome completo del teorema di Gödel sull'incompletezza?"

2. OPZIONI DI RISPOSTA:
   - 4 opzioni plausibili e ben bilanciate
   - Evita opzioni ovviamente sbagliate
   - Distribuisci la risposta corretta casualmente (A, B, C, D)

3. QUALITÀ:
   - Domande chiare e precise
   - Evita ambiguità
   - Spiegazioni concise ma informative

4. VARIETÀ:
   - Usa tutte le categorie richieste equamente
   - Varia il tipo di domande (date, persone, luoghi, eventi, concetti)

FORMATO OUTPUT (SOLO JSON, niente altro testo):
[
  {
    "question": "Testo della domanda",
    "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
    "correctAnswer": 0,
    "difficultyLevel": 1,
    "difficultyName": "Principiante",
    "category": "Storia",
    "explanation": "Spiegazione breve e chiara"
  }
]

IMPORTANTE: 
- Rispondi ESCLUSIVAMENTE con il JSON array
- NO markdown, NO testo aggiuntivo
- difficultyLevel deve essere un numero da 1 a 10
- difficultyName deve corrispondere al livello`

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
   * Calculate difficulty progression for questions (1-10 scale)
   * @param {number} numQuestions 
   * @returns {Array<Object>}
   */
  calculateDifficultyProgression(numQuestions) {
    const difficulties = QUIZ_CONFIG.DIFFICULTY_LEVELS
    const progression = []

    for (let i = 0; i < numQuestions; i++) {
      // Linear progression from level 1 to 10
      const ratio = i / (numQuestions - 1)
      const index = Math.floor(ratio * (difficulties.length - 1))
      progression.push(difficulties[index])
    }

    return progression
  }

  /**
   * Distribute categories evenly across questions
   * @param {number} numQuestions 
   * @param {Array<string>} categories 
   * @returns {Array<string>}
   */
  distributeCategoriesAcrossQuestions(numQuestions, categories) {
    if (!categories || categories.length === 0) {
      return Array(numQuestions).fill('cultura generale')
    }

    const distribution = []
    for (let i = 0; i < numQuestions; i++) {
      distribution.push(categories[i % categories.length])
    }

    // Shuffle to avoid predictable pattern
    return distribution.sort(() => Math.random() - 0.5)
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

