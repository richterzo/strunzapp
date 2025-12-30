import { BaseOpenAIService } from './baseService'

/**
 * Strunzate Service - Handles conversation starter questions
 * Generates thought-provoking questions across 4 categories:
 * Personali, Filosofiche, Piccanti, Scomode
 */
export class StrunzateService extends BaseOpenAIService {
  categoryMapping = {
    personali: 'Personali',
    filosofiche: 'Filosofiche',
    scottanti: 'Piccanti',
    scomode: 'Scomode'
  }

  /**
   * Build system prompt for Strunzate questions
   * @param {string} category - Question category
   * @param {Array<string>} usedQuestions - Previously used questions
   * @returns {string}
   */
  buildSystemPrompt(category, usedQuestions = []) {
    return `Agisci come un autore di giochi conversazionali provocatori e intelligenti.
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

CATEGORIA: ${this.categoryMapping[category]}

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

GENERA 1 DOMANDA UNICA per ${this.categoryMapping[category]}.
RISPETTA RIGOROSAMENTE il topic della categoria.
In italiano. Solo la domanda nel JSON.`
  }

  /**
   * Generate a conversation question for Strunzate game
   * @param {string} category - Question category (personali, filosofiche, scottanti, scomode)
   * @param {Array<string>} usedQuestions - Previously used questions to avoid duplicates
   * @returns {Promise<Object>} Question object
   */
  async generateStrunzateQuestion(category, usedQuestions = []) {
    if (!this.isConfigured()) {
      throw new Error('API not configured')
    }

    const systemPrompt = this.buildSystemPrompt(category, usedQuestions)
    const userPrompt = `Genera 1 domanda originale e memorabile per la categoria "${this.categoryMapping[category]}".`

    try {
      const content = await this.makeAPICall(systemPrompt, userPrompt, {
        temperature: 1.0, // Maximum creativity
        maxTokens: 200,
        responseFormat: { type: "json_object" }
      })

      const result = JSON.parse(content)

      return {
        question: result.question
      }
    } catch (error) {
      console.error('Error generating Strunzate question:', error)
      throw error
    }
  }
}

// Export singleton instance
export const strunzateService = new StrunzateService()

