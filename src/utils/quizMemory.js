// Quiz Memory System - localStorage management for questions history
// Prevents question repetition and ensures topic variety

const STORAGE_KEY = 'dragonQuizHistory'
const MAX_QUESTIONS_STORED = 500 // Limit to prevent localStorage overflow
const MAX_CATEGORY_HISTORY = 30 // Track last 30 categories used

/**
 * Get all used questions from localStorage
 * @returns {Array} Array of question texts
 */
export function getUsedQuestions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const parsed = JSON.parse(data)
    return parsed.questions || []
  } catch (error) {
    console.error('Error reading quiz history:', error)
    return []
  }
}

/**
 * Get recently used categories
 * @returns {Array} Array of recently used category names
 */
export function getRecentCategories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const parsed = JSON.parse(data)
    return parsed.recentCategories || []
  } catch (error) {
    console.error('Error reading category history:', error)
    return []
  }
}

/**
 * Save a new question to history
 * @param {string} questionText - The question text
 * @param {string} category - The category of the question
 */
export function saveQuestion(questionText, category) {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    let history = data ? JSON.parse(data) : { questions: [], recentCategories: [] }
    
    // Add question (prevent duplicates)
    if (!history.questions.includes(questionText)) {
      history.questions.push(questionText)
    }
    
    // Add category to recent list
    history.recentCategories.push(category)
    
    // Trim to max size (keep most recent)
    if (history.questions.length > MAX_QUESTIONS_STORED) {
      history.questions = history.questions.slice(-MAX_QUESTIONS_STORED)
    }
    
    if (history.recentCategories.length > MAX_CATEGORY_HISTORY) {
      history.recentCategories = history.recentCategories.slice(-MAX_CATEGORY_HISTORY)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving quiz history:', error)
    // If localStorage is full, clear old data
    if (error.name === 'QuotaExceededError') {
      clearOldHistory()
      // Try again
      try {
        const minimalHistory = {
          questions: [questionText],
          recentCategories: [category]
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalHistory))
      } catch (e) {
        console.error('Failed to save even minimal history:', e)
      }
    }
  }
}

/**
 * Get next category to use, ensuring variety
 * @param {Array} availableCategories - Array of all available categories
 * @returns {string} Category to use next
 */
export function getNextCategory(availableCategories) {
  if (!availableCategories || availableCategories.length === 0) {
    return 'Cultura Generale'
  }
  
  const recentCategories = getRecentCategories()
  
  // If no history, pick random
  if (recentCategories.length === 0) {
    return availableCategories[Math.floor(Math.random() * availableCategories.length)]
  }
  
  // Count frequency of each category in recent history
  const categoryCount = {}
  recentCategories.forEach(cat => {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  
  // Find least used categories
  const leastUsed = availableCategories.filter(cat => {
    return !categoryCount[cat] || categoryCount[cat] === Math.min(...Object.values(categoryCount))
  })
  
  // Pick random from least used
  if (leastUsed.length > 0) {
    return leastUsed[Math.floor(Math.random() * leastUsed.length)]
  }
  
  // Fallback: pick random
  return availableCategories[Math.floor(Math.random() * availableCategories.length)]
}

/**
 * Clear old history to free up space
 */
function clearOldHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return
    
    const parsed = JSON.parse(data)
    
    // Keep only last 100 questions and 10 categories
    const trimmed = {
      questions: (parsed.questions || []).slice(-100),
      recentCategories: (parsed.recentCategories || []).slice(-10)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Error clearing old history:', error)
    // If all else fails, clear completely
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear history:', e)
    }
  }
}

/**
 * Clear all quiz history (for testing or reset)
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing history:', error)
  }
}

/**
 * Get statistics about quiz history
 * @returns {Object} Statistics object
 */
export function getHistoryStats() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return { totalQuestions: 0, categories: {} }
    
    const parsed = JSON.parse(data)
    const questions = parsed.questions || []
    const recentCategories = parsed.recentCategories || []
    
    // Count categories
    const categoryCount = {}
    recentCategories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })
    
    return {
      totalQuestions: questions.length,
      categories: categoryCount,
      recentCategories: recentCategories.slice(-10)
    }
  } catch (error) {
    console.error('Error getting history stats:', error)
    return { totalQuestions: 0, categories: {} }
  }
}

