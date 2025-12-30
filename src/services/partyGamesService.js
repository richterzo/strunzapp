import { BaseOpenAIService } from './baseService'

/**
 * Party Games Service - Handles word generation for Stronzo and Merda Vincente
 * Generates themed words based on category and difficulty
 */
export class PartyGamesService extends BaseOpenAIService {
  /**
   * Generate words for party games (Stronzo, Merda Vincente)
   * @param {string} category - Word category
   * @param {string} difficulty - Difficulty level (facile, medio, difficile)
   * @param {number} count - Number of words to generate
   * @param {string} gameType - Type of game (stronzo, intesa)
   * @returns {Promise<Array<string>|null>} Array of words or null if failed
   */
  async generatePartyWords(category, difficulty, count, gameType = 'intesa') {
    if (!this.isConfigured()) {
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

    const systemPrompt = 'Sei un esperto creatore di giochi da tavolo. Generi parole perfette per party games. Rispondi SOLO con JSON array.'

    const userPrompt = `Genera ESATTAMENTE ${count} parole in italiano per il gioco "${gameType}".

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
      const content = await this.makeAPICall(systemPrompt, userPrompt, {
        temperature: 1.0, // High creativity
        maxTokens: 500
      })

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
}

// Export singleton instance
export const partyGamesService = new PartyGamesService()

