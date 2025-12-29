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

    const usedQuestionsContext = usedQuestions.length > 0 
      ? `\n\n⚠️ DOMANDE GIÀ USATE - NON RIPETERE MAI:
${usedQuestions.slice(-30).join('\n')}

IMPORTANTE: Ogni giocatore deve avere una domanda COMPLETAMENTE DIVERSA. 
Non fare domande simili o variazioni delle domande già usate!\n`
      : '\n\n✓ Prima domanda del gioco - sii creativo!\n'

    // Parametric difficulty description based on level
    const getDifficultyDescription = (level) => {
      const descriptions = {
        1: {
          knowledge: 'Conoscenze basilari universalmente note',
          examples: 'Capitali principali, eventi storici recenti noti, celebrità famose',
          complexity: 'Domande dirette e semplici'
        },
        2: {
          knowledge: 'Cultura generale elementare',
          examples: 'Geografia di base, opere famose, fatti storici importanti',
          complexity: 'Domande chiare con risposta nota alla maggior parte'
        },
        3: {
          knowledge: 'Cultura generale media',
          examples: 'Date importanti, autori classici, scoperte scientifiche note',
          complexity: 'Richiede memoria di eventi e nomi noti'
        },
        4: {
          knowledge: 'Conoscenze specifiche ma accessibili',
          examples: 'Dettagli su opere d\'arte, eventi storici con date, personaggi secondari',
          complexity: 'Richiede buona cultura generale'
        },
        5: {
          knowledge: 'Cultura approfondita',
          examples: 'Date precise, nomi completi, dettagli tecnici di base',
          complexity: 'Difficile ma risolvibile con buona preparazione'
        },
        6: {
          knowledge: 'Expertise settoriale',
          examples: 'Dettagli biografici, date esatte, termini tecnici specifici',
          complexity: 'Molto difficile, richiede conoscenze specialistiche'
        },
        7: {
          knowledge: 'Conoscenze da esperto',
          examples: 'Dettagli oscuri ma verificabili, formule, valori numerici',
          complexity: 'Estremamente difficile, dettagli raramente noti'
        },
        8: {
          knowledge: 'Expertise assoluta',
          examples: 'Fatti storici secondari cruciali, dettagli tecnici avanzati, citazioni',
          complexity: 'Quasi impossibile senza studio specifico'
        },
        9: {
          knowledge: 'Conoscenze enciclopediche',
          examples: 'Dettagli ultra-specifici, nomi completi rari, date precise di pubblicazioni',
          complexity: 'Impossibile per la maggior parte, richiede memoria eccezionale'
        },
        10: {
          knowledge: 'Livello DRAGONE - domanda finale',
          examples: 'Combinazione di dettagli rarissimi, conoscenze multi-disciplinari oscure',
          complexity: 'Domanda da Dragone: quasi impossibile, richiede fortuna o expertise assoluta'
        }
      }
      return descriptions[level] || descriptions[5]
    }

    const diffDescription = getDifficultyDescription(difficultyLevel)

    const prompt = `Genera UNA SINGOLA domanda di quiz in italiano, stile "DRAGON QUIZ".

CATEGORIA: ${selectedCategory}
LIVELLO DI DIFFICOLTÀ: ${difficultyLevel}/10 - ${difficultyData.name.toUpperCase()}

PARAMETRI DI DIFFICOLTÀ PER LIVELLO ${difficultyLevel}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 TIPO DI CONOSCENZE: ${diffDescription.knowledge}
📖 AMBITO: ${diffDescription.examples}
🎯 COMPLESSITÀ: ${diffDescription.complexity}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCALA PROGRESSIVA (tipo "Chi vuol essere milionario"):
${Array.from({length: 10}, (_, i) => {
  const l = i + 1
  const desc = getDifficultyDescription(l)
  return `Livello ${l}/10: ${desc.knowledge} - ${desc.complexity}`
}).join('\n')}

LA TUA DOMANDA DEVE ESSERE ESATTAMENTE AL LIVELLO ${difficultyLevel}/10!

REGOLE CRITICHE PER LA DIFFICOLTÀ:
${difficultyLevel <= 3 ? `
✓ Fatti universalmente noti
✓ Risposte che molti conoscono
✓ Domande chiare e dirette
` : difficultyLevel <= 6 ? `
✓ Dettagli specifici ma non oscuri
✓ Date precise o nomi completi
✓ Richiede cultura medio-alta
✓ Non troppo tecnico
` : `
✓ Dettagli rarissimi e oscuri
✓ Conoscenze ultra-specialistiche
✓ Combinazioni complesse
✓ Quasi impossibile indovinare
`}

${usedQuestionsContext}

REQUISITI ASSOLUTI:
1. Difficoltà ESATTA al livello ${difficultyLevel}/10
2. ESATTAMENTE 5 opzioni di risposta
3. Tutte le opzioni devono sembrare plausibili
4. Opzioni ben bilanciate e credibili
5. NO opzioni ovviamente sbagliate
6. Risposta corretta indicata con indice (0-4)
7. Spiegazione dettagliata e accurata
8. Domanda chiara e ben formulata
9. La domanda DEVE essere DIVERSA da quelle già usate
10. Stile Dragon Quiz - difficoltà progressiva da Base a Dragone

${difficultyLevel >= 8 ? 'ATTENZIONE: Livello ultra-difficile! La domanda deve essere quasi impossibile da indovinare!' : ''}
${difficultyLevel === 10 ? '🐉 DOMANDA DA DRAGONE! Deve essere la domanda più difficile possibile, quasi impossibile!' : ''}

FORMATO OUTPUT (SOLO JSON, niente altro testo):
{
  "question": "Testo della domanda ben formulata e chiara",
  "options": [
    "Opzione A - molto plausibile",
    "Opzione B - molto plausibile",
    "Opzione C - molto plausibile",
    "Opzione D - molto plausibile",
    "Opzione E - molto plausibile"
  ],
  "correctAnswer": 0,
  "difficultyLevel": ${difficultyLevel},
  "difficultyName": "${difficultyData.name}",
  "category": "${selectedCategory}",
  "explanation": "Spiegazione dettagliata con contesto e perché la risposta è corretta"
}

IMPORTANTE: 
- Rispondi ESCLUSIVAMENTE con l'oggetto JSON
- NO markdown, NO testo aggiuntivo
- ESATTAMENTE 5 OPZIONI
- Difficoltà calibrata PRECISAMENTE al livello ${difficultyLevel}/10
- Stile Dragon Quiz - progressione da Base a Dragone`

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
   * Generate random words for party games (Stronzo, Intesa Vincente)
   * @param {string} category - Category of words
   * @param {string} difficulty - Difficulty level (facile, medio, difficile)
   * @param {number} count - Number of words to generate
   * @param {string} gameType - Type of game (stronzo, intesa)
   * @returns {Promise<Array>} Array of words
   */
  async generatePartyWords(category, difficulty, count, gameType = 'intesa') {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using fallback words')
      return null // Return null to use fallback
    }

    const difficultyDescriptions = {
      facile: 'parole comuni e facili da indovinare/spiegare',
      medio: 'parole di media difficoltà, richiedono un po\' di creatività',
      difficile: 'parole difficili, tecniche o astratte'
    }

    const gameDescriptions = {
      stronzo: 'Gioco dove i giocatori devono indovinare la parola segreta. Le parole devono essere concrete, comuni e facili da collegare.',
      intesa: 'Gioco dove un giocatore deve far indovinare la parola al compagno. Le parole devono essere indovinabili con sinonimi, descrizioni, gesti.'
    }

    const prompt = `Genera ESATTAMENTE ${count} parole in italiano per il gioco "${gameType}".

CATEGORIA: ${category}
DIFFICOLTÀ: ${difficulty} (${difficultyDescriptions[difficulty]})
TIPO DI GIOCO: ${gameDescriptions[gameType]}

REGOLE FONDAMENTALI:
1. Parole appropriate per il livello di difficoltà
2. Nessuna parola troppo oscura o impossibile
3. Parole concrete e tangibili (evita concetti troppo astratti)
4. Varietà: non ripetere parole simili o dello stesso campo semantico
5. Lunghezza: 1-3 parole massimo
6. NO nomi propri di persone specifiche
7. Adatte per essere indovinate/spiegate

FORMATO OUTPUT (SOLO JSON array di stringhe):
["Parola1", "Parola2", "Parola3", ...]

IMPORTANTE:
- Rispondi SOLO con l'array JSON
- NO testo aggiuntivo, NO markdown
- ESATTAMENTE ${count} parole`

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
              content: 'Sei un esperto creatore di giochi da tavolo. Generi parole perfette per party games. Rispondi SOLO con JSON array.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 1.0, // High creativity
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        console.error('OpenAI API error:', response.statusText)
        return null // Use fallback
      }

      const data = await response.json()
      const content = data.choices[0].message.content.trim()

      let words
      try {
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
        words = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error('Failed to parse words JSON:', content)
        return null // Use fallback
      }

      if (!Array.isArray(words) || words.length === 0) {
        console.error('Invalid words array received')
        return null // Use fallback
      }

      return words
    } catch (error) {
      console.error('Error generating party words:', error)
      return null // Use fallback
    }
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

