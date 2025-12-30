/**
 * Unified OpenAI Services Export
 * 
 * This file provides a single entry point for all AI-powered game services:
 * - Dragon Quiz: Progressive difficulty quiz questions
 * - Party Games: Word generation for Stronzo and Merda Vincente
 * - Strunzate: Conversation starter questions
 * 
 * Architecture:
 * - baseService.js: Base class with shared API utilities
 * - dragonQuizService.js: Dragon Quiz specific logic
 * - partyGamesService.js: Party games word generation
 * - strunzateService.js: Strunzate question generation
 * - index.js: Unified export (this file)
 */

import { BaseOpenAIService } from './baseService'
import { dragonQuizService } from './dragonQuizService'
import { partyGamesService } from './partyGamesService'
import { strunzateService } from './strunzateService'

/**
 * Unified OpenAI Service
 * Combines all game-specific services into a single interface
 * for backward compatibility
 */
class OpenAIService extends BaseOpenAIService {
  /**
   * Generate a single quiz question for Dragon Quiz
   * @param {number} difficultyLevel - Difficulty level (1-10)
   * @param {Array<string>} categories - Selected categories
   * @param {Array<string>} usedAnswers - Already used answers
   * @returns {Promise<Object>}
   */
  async generateSingleQuestion(difficultyLevel, categories = [], usedAnswers = []) {
    return dragonQuizService.generateSingleQuestion(difficultyLevel, categories, usedAnswers)
  }

  /**
   * Generate multiple quiz questions for Dragon Quiz
   * @param {number} numQuestions - Number of questions
   * @param {Array<string>} categories - Selected categories
   * @returns {Promise<Array>}
   */
  async generateQuizQuestions(numQuestions = 10, categories = []) {
    return dragonQuizService.generateQuizQuestions(numQuestions, categories)
  }

  /**
   * Generate words for party games (Stronzo, Merda Vincente)
   * @param {string} category - Word category
   * @param {string} difficulty - Difficulty level
   * @param {number} count - Number of words
   * @param {string} gameType - Game type (stronzo, intesa)
   * @returns {Promise<Array<string>|null>}
   */
  async generatePartyWords(category, difficulty, count, gameType = 'intesa') {
    return partyGamesService.generatePartyWords(category, difficulty, count, gameType)
  }

  /**
   * Generate conversation question for Strunzate
   * @param {string} category - Question category
   * @param {Array<string>} usedQuestions - Previously used questions
   * @returns {Promise<Object>}
   */
  async generateStrunzateQuestion(category, usedQuestions = []) {
    return strunzateService.generateStrunzateQuestion(category, usedQuestions)
  }
}

// Export default singleton instance for backward compatibility
export default new OpenAIService()

// Export individual services for direct access if needed
export {
  BaseOpenAIService,
  dragonQuizService,
  partyGamesService,
  strunzateService
}

