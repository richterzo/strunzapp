/**
 * Persistent memory system for Strunzate questions
 * Stores previously asked questions in localStorage to avoid repetition
 */

const STORAGE_KEY = 'strunzate_questions_history'
const MAX_HISTORY = 100 // Keep last 100 questions

/**
 * Get all previously asked questions from localStorage
 * @returns {string[]} Array of question texts
 */
export function getUsedQuestions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading Strunzate memory:', error)
    return []
  }
}

/**
 * Save a new question to memory
 * @param {string} question - The question text to save
 */
export function saveQuestion(question) {
  try {
    const history = getUsedQuestions()
    
    // Add new question at the beginning
    const updated = [question, ...history]
    
    // Keep only MAX_HISTORY most recent questions
    const trimmed = updated.slice(0, MAX_HISTORY)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    
    console.log(`Strunzate: Saved question. History size: ${trimmed.length}`)
  } catch (error) {
    console.error('Error saving Strunzate question:', error)
  }
}

/**
 * Check if a question has been asked before
 * @param {string} question - The question to check
 * @returns {boolean} True if question exists in history
 */
export function isQuestionUsed(question) {
  const history = getUsedQuestions()
  return history.includes(question)
}

/**
 * Get statistics about question history
 * @returns {Object} Statistics object
 */
export function getStats() {
  const history = getUsedQuestions()
  
  return {
    totalQuestions: history.length,
    storageUsed: new Blob([JSON.stringify(history)]).size,
    maxCapacity: MAX_HISTORY
  }
}

/**
 * Clear all question history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Strunzate: History cleared')
  } catch (error) {
    console.error('Error clearing Strunzate history:', error)
  }
}

export default {
  getUsedQuestions,
  saveQuestion,
  isQuestionUsed,
  getStats,
  clearHistory
}


