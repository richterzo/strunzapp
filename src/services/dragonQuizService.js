import { QUIZ_CONFIG } from '../config/api'
import { BaseOpenAIService } from './baseService'

/**
 * Dragon Quiz Service - Handles quiz question generation
 * Generates progressively difficult questions (levels 1-10) from various categories
 */
export class DragonQuizService extends BaseOpenAIService {
  /**
   * Get parametric difficulty description based on level
   * @param {number} level - Difficulty level (1-10)
   * @returns {Object} Difficulty description
   */
  getDifficultyDescription(level) {
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

  /**
   * Build system prompt for Dragon Quiz
   * @returns {string}
   */
  buildSystemPrompt() {
    return `Sei un esperto creatore di quiz professionali stile "Chi vuol essere milionario".

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
SOLO oggetto JSON valido. Zero testo aggiuntivo. Zero markdown.`
  }

  /**
   * Build user prompt for question generation
   * @param {number} difficultyLevel - Difficulty level (1-10)
   * @param {string} selectedCategory - Category for the question
   * @param {string} difficultyName - Name of difficulty level
   * @param {Array<string>} usedAnswers - Already used answers
   * @returns {string}
   */
  buildUserPrompt(difficultyLevel, selectedCategory, difficultyName, usedAnswers = []) {
    const diffDescription = this.getDifficultyDescription(difficultyLevel)
    const usedQuestionsContext = usedAnswers.length > 0 
      ? `\n\n⚠️ RISPOSTE GIÀ USATE - Evita domande con queste risposte:
${usedAnswers.slice(-30).join(', ')}

IMPORTANTE: Ogni giocatore deve avere una domanda COMPLETAMENTE DIVERSA. 
Non usare le risposte sopra come risposta corretta!\n`
      : '\n\n✓ Prima domanda del gioco - sii creativo!\n'

    return `Genera UNA SINGOLA domanda di quiz in italiano, stile "DRAGON QUIZ".

CATEGORIA: ${selectedCategory}
LIVELLO DI DIFFICOLTÀ: ${difficultyLevel}/10 - ${difficultyName.toUpperCase()}

PARAMETRI DI DIFFICOLTÀ PER LIVELLO ${difficultyLevel}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 TIPO DI CONOSCENZE: ${diffDescription.knowledge}
📖 AMBITO: ${diffDescription.examples}
🎯 COMPLESSITÀ: ${diffDescription.complexity}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCALA PROGRESSIVA (tipo "Chi vuol essere milionario"):
${Array.from({length: 10}, (_, i) => {
  const l = i + 1
  const desc = this.getDifficultyDescription(l)
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
✓ STILE COERENTE: Tutte le opzioni devono avere lo stesso formato
✓ DETTAGLIO UNIFORME: Stesso livello di dettaglio per tutte
✓ NO PATTERN GRAMMATICALI: Evita concordanze che rivelano la risposta
✓ NO "TUTTE/NESSUNA DELLE PRECEDENTI": Evita questi trucchi ovvi
✓ NO RIPETIZIONI SOSPETTE: Non ripetere parole chiave solo nella risposta giusta
✓ CREDIBILITÀ EQUIVALENTE: Ogni opzione deve sembrare potenzialmente corretta
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

📋 ESEMPI DI FORMATO CORRETTO:

ESEMPIO 1 - Livello 2/10:
{
  "question": "In che anno Cristoforo Colombo scoprì l'America?",
  "options": ["1492", "1498", "1485", "1490", "1502"],
  "correctAnswer": 0,
  "difficultyLevel": 2,
  "difficultyName": "Facile",
  "category": "Storia",
  "explanation": "Cristoforo Colombo sbarcò nelle Americhe il 12 ottobre 1492, credendo di aver raggiunto le Indie."
}

ESEMPIO 2 - Livello 5/10:
{
  "question": "Quale gas costituisce circa il 78% dell'atmosfera terrestre?",
  "options": ["Azoto", "Ossigeno", "Anidride carbonica", "Argon", "Idrogeno"],
  "correctAnswer": 0,
  "difficultyLevel": 5,
  "difficultyName": "Medio",
  "category": "Scienza",
  "explanation": "L'azoto (N₂) costituisce circa il 78% dell'atmosfera terrestre, seguito dall'ossigeno al 21%."
}

🎯 ORA GENERA LA TUA DOMANDA CON QUESTI PARAMETRI ESATTI:
- Categoria: "${selectedCategory}"
- Livello difficoltà: ${difficultyLevel}/10
- Nome difficoltà: "${difficultyName}"

RISPONDI CON UN SINGOLO OGGETTO JSON (SOLO JSON, niente testo extra)`
  }

  /**
   * Generate a single quiz question with specific difficulty
   * @param {number} difficultyLevel - Difficulty level (1-10)
   * @param {Array<string>} categories - Selected categories
   * @param {Array<string>} usedAnswers - Already used correct answers to avoid duplicates
   * @returns {Promise<Object>} Single question object
   */
  async generateSingleQuestion(difficultyLevel, categories = [], usedAnswers = []) {
    const difficultiesData = QUIZ_CONFIG.DIFFICULTY_LEVELS
    const difficultyData = difficultiesData.find(d => d.level === difficultyLevel) || difficultiesData[0]
    const selectedCategory = categories.length > 0 
      ? categories[Math.floor(Math.random() * categories.length)] 
      : 'cultura generale'

    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(
      difficultyLevel, 
      selectedCategory, 
      difficultyData.name, 
      usedAnswers
    )

    try {
      const content = await this.makeAPICall(systemPrompt, userPrompt, {
        temperature: 0.7,
        maxTokens: 600,
        responseFormat: { type: "json_object" }
      })

      // Parse JSON from response
      let question
      try {
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
    // Implementation would be similar to generateSingleQuestion
    // but called multiple times - kept minimal for file size
    const questions = []
    const usedAnswers = []

    for (let i = 0; i < numQuestions; i++) {
      const difficultyLevel = Math.min(i + 1, 10)
      try {
        const question = await this.generateSingleQuestion(difficultyLevel, categories, usedAnswers)
        questions.push(question)
        usedAnswers.push(question.options[question.correctAnswer])
      } catch (error) {
        console.error(`Error generating question ${i + 1}:`, error)
      }
    }

    return questions
  }
}

// Export singleton instance
export const dragonQuizService = new DragonQuizService()

