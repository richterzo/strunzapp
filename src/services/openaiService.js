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
   * @param {Array<string>} usedAnswers - Already used correct answers to avoid duplicates
   * @returns {Promise<Object>} Single question object
   */
  async generateSingleQuestion(difficultyLevel, categories = [], usedAnswers = []) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file')
    }

    const difficultiesData = QUIZ_CONFIG.DIFFICULTY_LEVELS
    const difficultyData = difficultiesData.find(d => d.level === difficultyLevel) || difficultiesData[0]
    const categoriesStr = categories.length > 0 ? categories.join(', ') : 'cultura generale'
    const selectedCategory = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)] : 'cultura generale'

    const usedQuestionsContext = usedAnswers.length > 0 
      ? `\n\n⚠️ RISPOSTE GIÀ USATE - Evita domande con queste risposte:
${usedAnswers.slice(-30).join(', ')}

IMPORTANTE: Ogni giocatore deve avere una domanda COMPLETAMENTE DIVERSA. 
Non usare le risposte sopra come risposta corretta!\n`
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

⚠️ REGOLE CRITICHE PER EVITARE INDIZI NELLE RISPOSTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ LUNGHEZZA SIMILE: Tutte le 5 opzioni devono avere lunghezza comparabile
  ❌ NO: "Roma", "La capitale della Francia fondata dai Romani nel 52 a.C."
  ✅ SI: "Roma", "Parigi", "Berlino", "Madrid", "Londra"

✓ STILE COERENTE: Tutte le opzioni devono avere lo stesso formato
  ❌ NO: "1492", "Nel 1519", "1776", "L'anno 1804"
  ✅ SI: "1492", "1519", "1776", "1804", "1607"

✓ DETTAGLIO UNIFORME: Stesso livello di dettaglio per tutte
  ❌ NO: "Leonardo da Vinci (1452-1519, pittore italiano)", "Michelangelo"
  ✅ SI: "Leonardo da Vinci", "Michelangelo Buonarroti", "Raffaello Sanzio"

✓ NO PATTERN GRAMMATICALI: Evita concordanze che rivelano la risposta
  ❌ NO: Domanda "Quale è la capitale?" → "Roma" (femminile singolare)
  ✅ SI: Riformula per evitare hint grammaticali

✓ NO "TUTTE/NESSUNA DELLE PRECEDENTI": Evita questi trucchi ovvi
  ❌ NO: opzione "Tutte le precedenti" quando è vera
  ✅ SI: Opzioni specifiche e concrete

✓ NO RIPETIZIONI SOSPETTE: Non ripetere parole chiave solo nella risposta giusta
  ❌ NO: Domanda su "fotosintesi" → risposta corretta unica con "fotosintesi"
  ✅ SI: Distribuisci termini tecnici in modo bilanciato

✓ CREDIBILITÀ EQUIVALENTE: Ogni opzione deve sembrare potenzialmente corretta
  ❌ NO: "1492", "1493", "1494", "Anno scorso", "2025"
  ✅ SI: "1492", "1493", "1485", "1498", "1490"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 QUALITÀ DELLE RISPOSTE:
- Ortografia perfetta (NO errori di battitura)
- Punteggiatura corretta
- Maiuscole/minuscole coerenti
- NO spazi extra o caratteri strani
- NO numeri romani mescolati con arabi senza motivo
- Formattazione uniforme (es. tutti con o tutti senza articolo)

${difficultyLevel >= 8 ? 'ATTENZIONE: Livello ultra-difficile! La domanda deve essere quasi impossibile da indovinare!' : ''}
${difficultyLevel === 10 ? '🐉 DOMANDA DA DRAGONE! Deve essere la domanda più difficile possibile, quasi impossibile!' : ''}

🔍 PROCESSO DI AUTO-VALIDAZIONE (esegui mentalmente PRIMA di rispondere):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✓ Le 5 opzioni hanno lunghezza simile? (max differenza: 50%)
2. ✓ Tutte le opzioni hanno lo stesso formato/stile?
3. ✓ Nessuna opzione ha dettagli extra che la rendono sospetta?
4. ✓ Nessuna concordanza grammaticale rivela la risposta?
5. ✓ La difficoltà è ESATTAMENTE quella del livello ${difficultyLevel}/10?
6. ✓ Tutte le opzioni sono storicamente/scientificamente plausibili?
7. ✓ Nessun errore di ortografia o battitura?
8. ✓ La spiegazione è accurata e dettagliata?

Se anche UNA SOLA risposta è NO → RICREA la domanda!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ESEMPI DI FORMATO CORRETTO (Few-shot learning):

ESEMPIO 1 - Livello 2/10, Facile, Storia:
{
  "question": "In che anno Cristoforo Colombo scoprì l'America?",
  "options": ["1492", "1498", "1485", "1490", "1502"],
  "correctAnswer": 0,
  "difficultyLevel": 2,
  "difficultyName": "Facile",
  "category": "Storia",
  "explanation": "Cristoforo Colombo sbarcò nelle Americhe il 12 ottobre 1492, credendo di aver raggiunto le Indie."
}

ESEMPIO 2 - Livello 5/10, Medio, Scienza:
{
  "question": "Quale gas costituisce circa il 78% dell'atmosfera terrestre?",
  "options": ["Azoto", "Ossigeno", "Anidride carbonica", "Argon", "Idrogeno"],
  "correctAnswer": 0,
  "difficultyLevel": 5,
  "difficultyName": "Medio",
  "category": "Scienza",
  "explanation": "L'azoto (N₂) costituisce circa il 78% dell'atmosfera terrestre, seguito dall'ossigeno al 21%."
}

ESEMPIO 3 - Livello 8/10, Esperto, Letteratura:
{
  "question": "In quale anno venne pubblicato per la prima volta 'Ulisse' di James Joyce?",
  "options": ["1922", "1920", "1925", "1918", "1924"],
  "correctAnswer": 0,
  "difficultyLevel": 8,
  "difficultyName": "Esperto",
  "category": "Letteratura",
  "explanation": "Il romanzo 'Ulisse' di James Joyce fu pubblicato per la prima volta a Parigi nel 1922 da Sylvia Beach."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ORA GENERA LA TUA DOMANDA CON QUESTI PARAMETRI ESATTI:
- Categoria: "${selectedCategory}"
- Livello difficoltà: ${difficultyLevel}/10
- Nome difficoltà: "${difficultyData.name}"

RISPONDI CON UN SINGOLO OGGETTO JSON (SOLO JSON, niente testo extra):

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
              content: `Sei un esperto creatore di quiz professionali stile "Chi vuol essere milionario".

TUO RUOLO:
Generi domande a difficoltà calibrata con opzioni di risposta perfettamente bilanciate.

COMPETENZE:
- Difficoltà PRECISA al livello richiesto (da 1 a 10)
- Opzioni equivalenti in lunghezza e stile (zero indizi)
- Ortografia e punteggiatura impeccabili
- Contenuti accurati e verificabili

PROCESSO OBBLIGATORIO:
1. Leggi categoria, difficoltà e requisiti
2. Crea domanda + 5 opzioni bilanciate
3. AUTO-VALIDA: lunghezza simile? stile coerente? zero hint? difficoltà esatta?
4. Se QUALCOSA non va → RICREA da zero
5. Solo quando PERFETTA → genera JSON

OUTPUT:
SOLO oggetto JSON valido. Zero testo aggiuntivo. Zero markdown.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7, // Balanced: creative but consistent
          max_tokens: 600, // Enough for detailed questions
          response_format: { type: "json_object" }, // Force JSON output
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

Livello 3-4 (BASE/INTERMEDIO):
- Cultura generale di base
- Richiede un minimo di istruzione
- Fatti abbastanza noti

Livello 5-6 (MEDIO/AVANZATO):
- Richiede cultura media-alta
- Dettagli specifici ma non oscuri
- Conoscenze settoriali

Livello 7-8 (DIFFICILE/ESPERTO):
- Richiede conoscenze approfondite
- Dettagli specifici e date precise
- Fatti meno conosciuti

Livello 9-10 (MAESTRO/LEGGENDA):
- Conoscenze molto specialistiche
- Dettagli oscuri e rari
- Richiede expertise nel campo
- Date precise, nomi completi

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
   * Generate random words for party games (Stronzo, Merda Vincente)
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
   * Generate a conversation question for Strunzate game
   */
  async generateStrunzateQuestion(category, usedQuestions = []) {
    if (!this.isConfigured()) {
      throw new Error('API not configured')
    }

    const categoryMapping = {
      personali: 'Personali',
      filosofiche: 'Filosofiche',
      scottanti: 'Piccanti',
      scomode: 'Scomode'
    }

    const systemPrompt = `Agisci come un autore di giochi conversazionali provocatori e intelligenti.
Il tuo compito è generare DOMANDE ORIGINALI, NON COMUNI e MEMORABILI
per stimolare conversazioni tra amici.

REGOLE FONDAMENTALI (obbligatorie):
- NON usare domande generiche, motivazionali o da coaching
- EVITA parole come: sogni, felicità, obiettivi, crescita personale, comfort zone
- NESSUNA domanda deve essere risolvibile con sì/no
- Ogni domanda deve creare almeno UNA di queste tensioni:
  • conflitto morale
  • scelta irreversibile
  • esposizione sociale controllata
  • rivelazione inaspettata
  • immaginazione concreta con conseguenze

STRUTTURA DELLE DOMANDE:
- Frasi brevi, dirette
- Linguaggio naturale da conversazione reale
- Nessun tono terapeutico o filosofico accademico
- Deve sembrare una domanda che "resta addosso" dopo aver risposto

VINCOLI DI QUALITÀ:
- Ogni domanda deve essere SPECIFICA (tempo, persona, conseguenza)
- Vietate domande astratte o vaghe
- Vietato l'uso di "perché pensi che", "secondo te", "come ti senti"

CATEGORIA: ${categoryMapping[category]}

OUTPUT: Solo JSON con questa struttura:
{
  "question": "La domanda"
}

═══════════════════════════════════════════════════
CATEGORIA: PERSONALI
Topic: Esperienze personali, relazioni, emozioni vissute
═══════════════════════════════════════════════════
- "In quale momento preciso hai capito che un'amicizia era finita?"
- "Quando è stata l'ultima volta che hai pianto da solo e perché?"
- "C'è qualcuno del tuo passato che pensi ancora oggi?"
- "Quale persona hai deluso di più nella tua vita?"
- "Quando ti sei sentito più solo pur essendo circondato da persone?"

═══════════════════════════════════════════════════
CATEGORIA: FILOSOFICHE
Topic: Etica, morale, vita, morte, scelte esistenziali profonde
═══════════════════════════════════════════════════
- "Se potessi salvare la vita di uno sconosciuto a costo della tua, lo faresti?"
- "Preferiresti vivere 100 anni infelice o 30 anni pienamente felice?"
- "È giusto mentire per proteggere qualcuno dalla verità dolorosa?"
- "Cosa faresti nell'ultimo giorno se sapessi che domani moriresti?"
- "Può esistere amore senza possesso? O è sempre egoismo mascherato?"

═══════════════════════════════════════════════════
CATEGORIA: PICCANTI
Topic: SOLO sesso, fantasie sessuali, intimità fisica, dettagli relazioni
═══════════════════════════════════════════════════
- "Con chi in questa stanza avresti voluto fare sesso almeno una volta?"
- "Qual è la fantasia sessuale che non hai mai confessato a nessuno?"
- "Hai mai fatto sesso pensando a qualcun altro?"
- "Qual è la cosa che ti eccita di più durante il sesso?"
- "Hai mai avuto un threesome? Se no, con chi lo faresti?"
- "Quale parte del corpo ti eccita di più in un partner?"
- "Hai mai fatto sexting con qualcuno mentre eri impegnato?"
- "Qual è il tuo kink o feticcio segreto?"
- "Preferiresti sesso passionale veloce o lento e romantico?"
- "Hai mai finto un orgasmo? Perché?"
- "Con quale celebrità faresti sesso subito se potessi?"
- "Qual è stata la tua prima esperienza sessuale? Com'è andata davvero?"

═══════════════════════════════════════════════════
CATEGORIA: SCOMODE
Topic: Verità imbarazzanti su di te, situazioni ipotetiche difficili
═══════════════════════════════════════════════════
- "Se potessi cancellare una persona dalla tua vita come se non fosse mai esistita, chi sarebbe?"
- "Hai mai provato piacere nel vedere qualcuno fallire?"
- "Se trovassi 10.000 euro per strada cosa faresti davvero?"
- "Quale parte di te stesso odi ma fingi di accettare?"
- "Se potessi leggere i pensieri di qualcuno per un giorno, chi sceglieresti?"

═══════════════════════════════════════════════════
DOMANDE GIÀ USATE (NON RIPETERE):
${usedQuestions.length > 0 ? usedQuestions.slice(0, 20).map(q => `- "${q}"`).join('\n') : 'Nessuna domanda precedente'}

VINCOLI ASSOLUTI PER OGNI CATEGORIA:
═══════════════════════════════════════════════════

PERSONALI:
✅ Esperienze concrete vissute
✅ Relazioni specifiche (amicizie, famiglia, amore)
✅ Emozioni autentiche provate
❌ NO filosofia, NO etica, NO sesso esplicito

FILOSOFICHE:
✅ Dilemmi morali ed etici profondi
✅ Vita, morte, senso esistenziale
✅ Scelte impossibili e conseguenze
❌ NO esperienze personali banali, NO sesso

PICCANTI:
✅ SOLO sesso esplicito
✅ Fantasie sessuali concrete e varie
✅ Preferenze, kink, feticci
✅ Esperienze intime specifiche
✅ Situazioni ipotetiche sessuali
✅ Prime volte, desideri nascosti
❌ NO sempre "più strano/folle/intenso"
❌ NO romanticismo generico, NO filosofia
❌ NO domande ripetitive tipo "posto più strano"

SCOMODE:
✅ Verità imbarazzanti su se stessi
✅ Situazioni ipotetiche che mettono in difficoltà
✅ Pensieri oscuri che non si dicono
❌ NO sesso esplicito, NO filosofia astratta

SEMPRE VIETATO:
❌ segreto, sogni, paure generiche, obiettivi
❌ "cosa pensi di", "come ti senti se", "secondo te"
❌ Domande risolvibili con sì/no

PER PICCANTI - VARIETÀ OBBLIGATORIA:
═══════════════════════════════════════════════════
✅ Alterna tra: fantasie, preferenze, esperienze, kink, situazioni ipotetiche
✅ Varia il focus: partner, luoghi, atti specifici, feticci, prime volte
✅ Usa verbi diversi: preferire, desiderare, eccitare, provare, sperimentare
❌ MAI sempre "posto più strano", "esperienza più folle", "cosa più intensa"
❌ MAI ripetere lo stesso tipo di domanda
❌ MAI essere generici o vaghi

SEMPRE OBBLIGATORIO:
✅ Dettagli specifici, tempi precisi, persone concrete
✅ Domande che facciano pensare "cazzo, questa è forte"
✅ Linguaggio diretto, niente toni da terapeuta

GENERA 1 DOMANDA UNICA per ${categoryMapping[category]}.
RISPETTA RIGOROSAMENTE il topic della categoria.
In italiano. Solo la domanda nel JSON.`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Genera 1 domanda originale e memorabile per la categoria "${categoryMapping[category]}".` }
          ],
          temperature: 1.0,
          max_tokens: 200,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)

      return {
        question: result.question
      }
    } catch (error) {
      console.error('Error generating Strunzate question:', error)
      throw error
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

