// Words Memory System - localStorage management for party games
// Prevents word repetition across sessions

const STRONZO_KEY = 'stronzoWordsHistory'
const INTESA_KEY = 'intesaWordsHistory'
const MAX_WORDS_STORED = 300

/**
 * Get used words for a specific game
 * @param {string} gameType - 'stronzo' or 'intesa'
 * @returns {Array} Array of used words
 */
export function getUsedWords(gameType) {
  try {
    const key = gameType === 'stronzo' ? STRONZO_KEY : INTESA_KEY
    const data = localStorage.getItem(key)
    if (!data) return []
    
    const parsed = JSON.parse(data)
    return parsed.words || []
  } catch (error) {
    console.error(`Error reading ${gameType} words history:`, error)
    return []
  }
}

/**
 * Save a new word to history
 * @param {string} gameType - 'stronzo' or 'intesa'
 * @param {string} word - The word to save
 */
export function saveWord(gameType, word) {
  try {
    const key = gameType === 'stronzo' ? STRONZO_KEY : INTESA_KEY
    const data = localStorage.getItem(key)
    let history = data ? JSON.parse(data) : { words: [] }
    
    // Add word (prevent duplicates)
    if (!history.words.includes(word)) {
      history.words.push(word)
    }
    
    // Trim to max size (keep most recent)
    if (history.words.length > MAX_WORDS_STORED) {
      history.words = history.words.slice(-MAX_WORDS_STORED)
    }
    
    localStorage.setItem(key, JSON.stringify(history))
  } catch (error) {
    console.error(`Error saving ${gameType} word:`, error)
    // If localStorage is full, clear old data
    if (error.name === 'QuotaExceededError') {
      clearOldWords(gameType)
    }
  }
}

/**
 * Clear old words to free up space
 * @param {string} gameType - 'stronzo' or 'intesa'
 */
function clearOldWords(gameType) {
  try {
    const key = gameType === 'stronzo' ? STRONZO_KEY : INTESA_KEY
    const data = localStorage.getItem(key)
    if (!data) return
    
    const parsed = JSON.parse(data)
    
    // Keep only last 100 words
    const trimmed = {
      words: (parsed.words || []).slice(-100)
    }
    
    localStorage.setItem(key, JSON.stringify(trimmed))
  } catch (error) {
    console.error(`Error clearing old ${gameType} words:`, error)
  }
}

/**
 * Clear all words history for a game
 * @param {string} gameType - 'stronzo' or 'intesa'
 */
export function clearWordsHistory(gameType) {
  try {
    const key = gameType === 'stronzo' ? STRONZO_KEY : INTESA_KEY
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error clearing ${gameType} history:`, error)
  }
}

/**
 * Get statistics about words history
 * @param {string} gameType - 'stronzo' or 'intesa'
 * @returns {Object} Statistics object
 */
export function getWordsStats(gameType) {
  try {
    const words = getUsedWords(gameType)
    return {
      totalWords: words.length,
      recentWords: words.slice(-20)
    }
  } catch (error) {
    console.error(`Error getting ${gameType} stats:`, error)
    return { totalWords: 0, recentWords: [] }
  }
}


