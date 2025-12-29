import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import openaiService from '../services/openaiService'
import './StrunzateGameScreen.css'

export default function StrunzateGameScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { numQuestions, categories } = location.state || {}

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const categoryNames = {
    personali: 'Personali',
    filosofiche: 'Filosofiche',
    scottanti: 'Scottanti',
    scomode: 'Scomode'
  }

  const categoryIcons = {
    personali: '💭',
    filosofiche: '🤔',
    scottanti: '🔥',
    scomode: '😬'
  }

  useEffect(() => {
    if (!numQuestions || !categories) {
      navigate('/strunzate/setup')
      return
    }
    loadQuestion()
  }, [currentQuestionIndex])

  const loadQuestion = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Select random category from selected ones
      const category = categories[Math.floor(Math.random() * categories.length)]
      
      const question = await openaiService.generateStrunzateQuestion(category)
      
      setCurrentQuestion({ ...question, category })
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading question:', err)
      setError('Errore nel caricamento della domanda. Riprova.')
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < numQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Game finished
      navigate('/')
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  if (!numQuestions || !categories) {
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
            Domanda {currentQuestionIndex + 1} di {numQuestions}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / numQuestions) * 100}%` }}
            />
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

            {currentQuestion.context && (
              <div className="context-box">
                <p className="context-text">{currentQuestion.context}</p>
              </div>
            )}

            <div className="action-buttons">
              <button className="skip-button" onClick={handleSkip}>
                SALTA
              </button>
              <button className="next-button" onClick={handleNext}>
                {currentQuestionIndex < numQuestions - 1 ? 'PROSSIMA' : 'FINE'}
              </button>
            </div>

            <div className="hints-box">
              <p className="hints-title">💡 Suggerimenti:</p>
              <ul className="hints-list">
                <li>Prenditi il tempo per riflettere</li>
                <li>Non ci sono risposte giuste o sbagliate</li>
                <li>Sii autentico e onesto</li>
                <li>Ascolta attivamente le risposte degli altri</li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

