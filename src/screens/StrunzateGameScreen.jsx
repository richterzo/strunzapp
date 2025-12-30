import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import openaiService from '../services/openaiService'
import strunzateMemory from '../utils/strunzateMemory'
import './StrunzateGameScreen.css'

export default function StrunzateGameScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { categories } = location.state || {}

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState([])

  const categoryNames = {
    personali: 'Personali',
    filosofiche: 'Filosofiche',
    piccanti: 'Piccanti',
    scomode: 'Scomode'
  }

  const categoryIcons = {
    personali: '💭',
    filosofiche: '🤔',
    piccanti: '🔥',
    scomode: '😬'
  }

  useEffect(() => {
    if (!categories) {
      navigate('/strunzate/setup')
      return
    }
    
    // Load historical questions
    const history = strunzateMemory.getUsedQuestions()
    setUsedQuestions(history)
    console.log(`Strunzate: Loaded ${history.length} questions from history`)
    
    loadQuestion()
  }, [])

  const loadQuestion = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Select random category from selected ones
      const category = categories[Math.floor(Math.random() * categories.length)]
      
      // Try to generate a unique question (max 3 attempts)
      let question
      let attempts = 0
      const maxAttempts = 3
      
      do {
        question = await openaiService.generateStrunzateQuestion(category, usedQuestions)
        attempts++
        
        // If question is unique or we've tried enough times, use it
        if (!usedQuestions.includes(question.question) || attempts >= maxAttempts) {
          break
        }
        
        console.log(`Strunzate: Question duplicate, retrying (${attempts}/${maxAttempts})...`)
      } while (attempts < maxAttempts)
      
      // Save question to memory
      strunzateMemory.saveQuestion(question.question)
      setUsedQuestions(prev => [question.question, ...prev].slice(0, 100))
      
      setCurrentQuestion({ ...question, category })
      setQuestionCount(prev => prev + 1)
      setIsLoading(false)
      
      console.log(`Strunzate: Generated question in ${attempts} attempts`)
    } catch (err) {
      console.error('Error loading question:', err)
      setError('Errore nel caricamento della domanda. Riprova.')
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    loadQuestion()
  }

  const handleSkip = () => {
    loadQuestion()
  }

  if (!categories) {
    return null
  }

  return (
    <div className="strunzate-game-screen">
      <div className="strunzate-game-content">
        <button className="back-button" onClick={() => navigate('/')}>
          ← ESCI
        </button>

        <div className="progress-container">
          <div className="progress-text">
            Domanda #{questionCount}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Generazione domanda...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={loadQuestion}>
              RIPROVA
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="question-container">
            <div className="category-badge">
              <span className="category-icon">{categoryIcons[currentQuestion.category]}</span>
              <span className="category-text">{categoryNames[currentQuestion.category]}</span>
            </div>

            <div className="question-card">
              <div className="question-icon">💬</div>
              <h2 className="question-text">{currentQuestion.question}</h2>
            </div>

            <div className="action-buttons">
              <button className="skip-button" onClick={handleSkip}>
                SALTA
              </button>
              <button className="next-button" onClick={handleNext}>
                PROSSIMA
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

