import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QUIZ_CONFIG } from '../config/api'
import './DragonQuizGameScreen.css'

export default function DragonQuizGameScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { gameMode, numPlayers, playerNames, questions, categories } = location.state || {}

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState(Array(numPlayers).fill(0))
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUIZ_CONFIG.TIME_PER_QUESTION)
  const [gamePhase, setGamePhase] = useState('question') // question, result, final
  const [answeredQuestions, setAnsweredQuestions] = useState(0)

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }
  }, [])

  useEffect(() => {
    if (gamePhase === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === 'question') {
      // Time's up - treat as wrong answer
      handleTimeUp()
    }
  }, [timeLeft, gamePhase])

  const handleTimeUp = () => {
    setShowResult(true)
    setGamePhase('result')
  }

  const handleAnswerSelect = (answerIndex) => {
    if (gamePhase !== 'question') return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    setGamePhase('result')

    // Calculate score
    const question = questions[currentQuestionIndex]
    const isCorrect = answerIndex === question.correctAnswer
    
    if (isCorrect) {
      const basePoints = QUIZ_CONFIG.POINTS_BASE
      const difficultyMultiplier = QUIZ_CONFIG.DIFFICULTY_MULTIPLIER[question.difficulty] || 1
      const timeBonus = Math.floor((timeLeft / QUIZ_CONFIG.TIME_PER_QUESTION) * 50)
      const points = Math.floor(basePoints * difficultyMultiplier) + timeBonus

      const newScores = [...scores]
      newScores[currentPlayerIndex] += points
      setScores(newScores)
    }

    setAnsweredQuestions(answeredQuestions + 1)
  }

  const handleNextQuestion = () => {
    // Check if all questions are done
    if (currentQuestionIndex >= questions.length - 1) {
      setGamePhase('final')
      return
    }

    // Move to next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers
    
    // If all players have answered this question, move to next question
    if (nextPlayerIndex === 0) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }

    setCurrentPlayerIndex(nextPlayerIndex)
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeLeft(QUIZ_CONFIG.TIME_PER_QUESTION)
    setGamePhase('question')
  }

  const handleNewGame = () => {
    navigate('/dragon-quiz/setup')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (gamePhase === 'final') {
    // Sort players by score
    const rankings = playerNames
      .map((name, index) => ({ name, score: scores[index] }))
      .sort((a, b) => b.score - a.score)

    return (
      <div className="game-screen">
        <div className="game-content">
          <h1 className="final-title">CLASSIFICA FINALE</h1>
          
          <div className="rankings-container">
            {rankings.map((player, index) => (
              <div key={index} className={`ranking-card rank-${index + 1}`}>
                <div className="rank-badge">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="rank-info">
                  <div className="rank-name">{player.name}</div>
                  <div className="rank-score">{player.score} pts</div>
                </div>
              </div>
            ))}
          </div>

          <div className="final-buttons">
            <button className="action-button primary" onClick={handleNewGame}>
              NUOVA PARTITA
            </button>
            <button className="action-button secondary" onClick={handleBackToHome}>
              MENU PRINCIPALE
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="game-screen">
        <div className="game-content">
          <div className="error-message">Nessuna domanda disponibile</div>
          <button className="action-button" onClick={handleBackToHome}>
            TORNA AL MENU
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestionIndex]
  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div className="game-screen">
      <div className="game-content">
        <div className="game-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="header-info">
            <span className="question-number">
              DOMANDA {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
        </div>

        <div className="current-player-section">
          <h3 className="player-label">TURNO DI</h3>
          <h2 className="player-name">{playerNames[currentPlayerIndex]}</h2>
        </div>

        <div className="question-section">
          <div className="difficulty-badge">{question.difficulty}</div>
          <div className="category-badge">{question.category}</div>
          <h2 className="question-text">{question.question}</h2>
        </div>

        {!showResult ? (
          <div className="answers-container">
            {question.options.map((option, index) => (
              <button
                key={index}
                className="answer-button"
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span className="answer-text">{option}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="result-container">
            <div className={`result-badge ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? '✓ CORRETTO!' : '✗ SBAGLIATO'}
            </div>

            <div className="correct-answer">
              <strong>Risposta corretta:</strong> {question.options[question.correctAnswer]}
            </div>

            {question.explanation && (
              <div className="explanation">
                <strong>Spiegazione:</strong>
                <p>{question.explanation}</p>
              </div>
            )}

            {isCorrect && (
              <div className="points-earned">
                +{scores[currentPlayerIndex] - (answeredQuestions > 1 ? scores[currentPlayerIndex] : 0)} punti
              </div>
            )}

            <button className="next-button" onClick={handleNextQuestion}>
              {currentQuestionIndex >= questions.length - 1 && currentPlayerIndex >= numPlayers - 1
                ? 'VEDI CLASSIFICA'
                : 'PROSSIMA DOMANDA →'}
            </button>
          </div>
        )}

        <div className="scores-section">
          <h4 className="scores-title">PUNTEGGI</h4>
          <div className="scores-grid">
            {playerNames.map((name, index) => (
              <div
                key={index}
                className={`score-chip ${index === currentPlayerIndex ? 'active' : ''}`}
              >
                <span className="score-name">{name}</span>
                <span className="score-value">{scores[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

