import { API_CONFIG, QUIZ_CONFIG } from '../config/api'

export class OpenAIService {
  constructor() {
    this.apiKey = API_CONFIG.OPENAI_API_KEY
    this.apiUrl = API_CONFIG.OPENAI_API_URL
    this.model = API_CONFIG.OPENAI_MODEL
  }

  /**
   * Generate a single quiz question with specific difficulty
   * @param {number} difficultyLevel - Difficulty level (1-10)
   * @param {Array<string>} categories - Selected categories
   * @param {Array<string>} usedQuestions - Already used questions to avoid duplicates
   * @returns {Promise<Object>} Single question object
   */
  async generateSingleQuestion(difficultyLevel, categories = [], usedQuestions = []) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file')
    }

    const difficultiesData = QUIZ_CONFIG.DIFFICULTY_LEVELS
    const difficultyData = difficultiesData.find(d => d.level === difficultyLevel) || difficultiesData[0]
    const categoriesStr = categories.length > 0 ? categories.join(', ') : 'cultura generale'
    const selectedCategory = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)] : 'cultura generale'

    // Create examples based on difficulty level
    const getExampleForLevel = (level) => {
      const examples = {
        5: '"Chi ha composto la \'Nona Sinfonia\' e in che anno è stata eseguita per la prima volta?"',
        6: '"Quale teorema matematico afferma che in un triangolo rettangolo il quadrato dell\'ipotenusa è uguale alla somma dei quadrati dei cateti?"',
        7: '"In che anno è stata ratificata la Costituzione degli Stati Uniti d\'America?"',
        8: '"Qual è il nome completo della teoria della relatività generale di Einstein?"',
        9: '"Quale elemento chimico ha numero atomico 79 e simbolo Au?"',
        10: '"Chi ha vinto il Premio Nobel per la Letteratura nel 1957?"',
        11: '"Qual è la costante di Planck espressa in joule-secondo con 4 cifre decimali?"',
        12: '"In che anno fu pubblicato il \'Tractatus Logico-Philosophicus\' di Wittgenstein?"',
        13: '"Qual è il nome del primo ministro giapponese che firmò la resa del Giappone nel 1945?"',
        14: '"Quanti sono i cromosomi nella sindrome di Edwards e qual è la loro disposizione esatta?"'
      }
      return examples[level] || examples[10]
    }

    const usedQuestionsContext = usedQuestions.length > 0 
      ? `\n\nEVITA ASSOLUTAMENTE queste domande già usate:\n${usedQuestions.slice(-20).join('\n')}\n`
      : ''

    const prompt = `Genera UNA SINGOLA domanda di quiz in italiano MOLTO DIFFICILE e APPROFONDITA.

CATEGORIA: ${selectedCategory}
DIFFICOLTÀ: Livello ${difficultyLevel}/14 - ${difficultyData.name.toUpperCase()}

SCALA DIFFICOLTÀ DETTAGLIATA (DA MEDIO AD ASSURDO):

Livello 5 (MEDIO): Richiede buona cultura generale e memoria
- Domande su fatti storici importanti con date
- Opere d'arte, letteratura, musica classica
- Geografia avanzata, capitali, fiumi principali
- Esempio: "Chi ha composto la 'Nona Sinfonia' e in che anno?"

Livello 6 (AVANZATO): Conoscenze specifiche e dettagliate
- Teoremi matematici, leggi fisiche con dettagli
- Eventi storici con protagonisti e contesti
- Opere letterarie con autori e periodi
- Esempio: "Quale teorema afferma che in un triangolo rettangolo..."

Livello 7 (DIFFICILE): Richiede conoscenze approfondite
- Date precise di eventi storici importanti
- Dettagli su scoperte scientifiche
- Artisti e opere con periodi storici
- Esempio: "In che anno fu ratificata la Costituzione USA?"

Livello 8 (ESPERTO): Expertise settoriale richiesta
- Formule scientifiche complete
- Date precise e nomi completi
- Dettagli tecnici specifici
- Esempio: "Nome completo della teoria della relatività generale"

Livello 9 (MAESTRO): Conoscenze molto specialistiche
- Tavola periodica con dettagli
- Premi Nobel con anni e categorie
- Eventi storici oscuri ma verificabili
- Esempio: "Elemento con numero atomico 79?"

Livello 10 (LEGGENDA): Cultura enciclopedica richiesta
- Dettagli molto specifici e rari
- Date precise di pubblicazioni
- Nomi completi e titoli esatti
- Esempio: "Premio Nobel Letteratura 1957?"

Livello 11 (DIVINO): Conoscenze da esperto assoluto
- Costanti fisiche con valori numerici
- Dettagli biografici oscuri
- Citazioni con fonti precise
- Esempio: "Valore costante di Planck con 4 decimali?"

Livello 12 (IMPOSSIBILE): Conoscenze ultra-specialistiche
- Pubblicazioni accademiche con date
- Dettagli tecnici rarissimi
- Nomi e titoli completi in lingua originale
- Esempio: "Anno pubblicazione Tractatus Logico-Philosophicus?"

Livello 13 (DEMONIACO): Conoscenze da archivio storico
- Personaggi storici secondari ma cruciali
- Eventi specifici con protagonisti esatti
- Dettagli che richiedono ricerca approfondita
- Esempio: "Nome del primo ministro giapponese alla resa 1945?"

Livello 14 (ASSURDO): Conoscenze da enciclopedia medica/scientifica
- Dettagli genetici, cromosomici
- Formule chimiche complesse
- Dati numerici precisi rarissimi
- Esempio: "Numero cromosomi sindrome di Edwards e disposizione?"

LA TUA DOMANDA DEVE ESSERE ESATTAMENTE LIVELLO ${difficultyLevel}/14!
NON FARE DOMANDE PIÙ FACILI! DEVE ESSERE MOLTO DIFFICILE!
${usedQuestionsContext}

REQUISITI CRITICI:
1. LA DIFFICOLTÀ DEVE ESSERE APPROPRIATA AL LIVELLO ${difficultyLevel}/14
2. Genera ESATTAMENTE 5 OPZIONI di risposta molto plausibili
3. TUTTE le opzioni devono sembrare corrette a prima vista
4. Evita opzioni ovviamente sbagliate
5. La risposta corretta deve essere indicata con un indice (0-4)
6. Includi una spiegazione dettagliata e accurata
7. La domanda deve essere specifica, tecnica e approfondita
8. Usa termini tecnici appropriati alla categoria
9. Richiedi conoscenze molto specifiche
10. La domanda DEVE essere DIVERSA da quelle già fatte

FORMATO OUTPUT (SOLO JSON, niente altro testo):
{
  "question": "Testo della domanda molto specifica e dettagliata",
  "options": ["Opzione A molto plausibile", "Opzione B molto plausibile", "Opzione C molto plausibile", "Opzione D molto plausibile", "Opzione E molto plausibile"],
  "correctAnswer": 0,
  "difficultyLevel": ${difficultyLevel},
  "difficultyName": "${difficultyData.name}",
  "category": "${selectedCategory}",
  "explanation": "Spiegazione dettagliata e tecnica del perché questa è la risposta corretta, con contesto storico/scientifico"
}

IMPORTANTE: 
- Rispondi ESCLUSIVAMENTE con l'oggetto JSON
- NO markdown, NO testo aggiuntivo, NO array
- ESATTAMENTE 5 OPZIONI
- DIFFICOLTÀ MASSIMA PER IL LIVELLO ${difficultyLevel}
- DOMANDE MOLTO SPECIFICHE E APPROFONDITE
- SOLO l'oggetto JSON della domanda`

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
              content: 'Sei un esperto creatore di quiz educativi. Generi domande accurate, interessanti e con difficoltà PRECISA e QUANTIFICABILE. La difficoltà deve essere ESATTAMENTE quella richiesta. Rispondi SOLO con JSON valido, senza testo aggiuntivo.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9, // Higher for more variety
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content.trim()
      
      // Parse JSON from response
      let question
      try {
        // Remove markdown code blocks if present
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
        question = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error('Failed to parse JSON:', content)
        throw new Error('Failed to parse quiz question from API response')
      }

      // Validate question
      if (!question.question || !question.options || question.options.length !== 5) {
        throw new Error('Invalid question structure received')
      }

      return question
    } catch (error) {
      console.error('Error generating single question:', error)
      throw error
    }
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

