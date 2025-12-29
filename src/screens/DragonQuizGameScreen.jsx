import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QUIZ_CONFIG } from '../config/api'
import openaiService from '../services/openaiService'
import './DragonQuizGameScreen.css'

export default function DragonQuizGameScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { gameMode, numPlayers, playerNames, teams, categories } =
    location.state || {}

  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1) // 1 to 10
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState(Array(numPlayers).fill(0))
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUIZ_CONFIG.TIME_PER_QUESTION)
  const [gamePhase, setGamePhase] = useState(
    gameMode === 'teams' ? 'selectPlayer' : 'loading'
  ) // selectPlayer, loading, question, result, final
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [usedQuestions, setUsedQuestions] = useState([])
  const [loadingError, setLoadingError] = useState(null)
  const [selectedPlayerInTeam, setSelectedPlayerInTeam] = useState(null) // Index of player in current team

  // Calculate current difficulty level based on question number (1-10)
  const getCurrentDifficultyLevel = () => {
    return currentQuestionNumber // Question 1 = Level 1, Question 10 = Level 10
  }

  // Load question for current player
  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }
    // In team mode, show player selection first
    if (gameMode === 'teams' && gamePhase === 'selectPlayer') {
      return
    }
    // Otherwise load question
    if (gamePhase === 'loading') {
      loadNextQuestion()
    }
  }, [currentQuestionNumber, currentPlayerIndex, gamePhase])

  const handlePlayerSelection = (playerIndex) => {
    setSelectedPlayerInTeam(playerIndex)
    setGamePhase('loading')
  }

  const loadNextQuestion = async () => {
    if (gamePhase === 'final') return

    setGamePhase('loading')
    setLoadingError(null)

    try {
      const difficultyLevel = getCurrentDifficultyLevel()
      const question = await openaiService.generateSingleQuestion(
        difficultyLevel,
        categories,
        usedQuestions
      )

      setCurrentQuestion(question)
      setUsedQuestions((prev) => [...prev, question.question])
      setTimeLeft(QUIZ_CONFIG.TIME_PER_QUESTION)
      setGamePhase('question')
    } catch (error) {
      console.error('Error loading question:', error)
      setLoadingError(error.message || 'Errore nel caricamento della domanda')
      setGamePhase('error')
    }
  }

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

    // Calculate score with difficulty system
    const isCorrect = answerIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      const basePoints = QUIZ_CONFIG.POINTS_BASE

      // Get difficulty multiplier from level
      const difficultyLevel = currentQuestion.difficultyLevel || 1
      const difficultyData = QUIZ_CONFIG.DIFFICULTY_LEVELS.find(
        (d) => d.level === difficultyLevel
      )
      const difficultyMultiplier = difficultyData
        ? difficultyData.multiplier
        : 1

      // Time bonus (max 50 points)
      const timeBonus = Math.floor(
        (timeLeft / QUIZ_CONFIG.TIME_PER_QUESTION) * QUIZ_CONFIG.TIME_BONUS_MAX
      )

      // Calculate total points
      const points = Math.floor(basePoints * difficultyMultiplier) + timeBonus

      const newScores = [...scores]
      newScores[currentPlayerIndex] += points
      setScores(newScores)
    }
  }

  const handleNextQuestion = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setSelectedPlayerInTeam(null)

    // Move to next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers

    // If all players have answered this question round
    if (nextPlayerIndex === 0) {
      // Check if we've completed all 10 question rounds
      if (currentQuestionNumber >= QUIZ_CONFIG.NUM_QUESTIONS) {
        setGamePhase('final')
        return
      }
      // Move to next question round (increase difficulty)
      setCurrentQuestionNumber((prev) => prev + 1)
    }

    setCurrentPlayerIndex(nextPlayerIndex)

    // In team mode, go to player selection
    if (gameMode === 'teams') {
      setGamePhase('selectPlayer')
    } else {
      // loadNextQuestion will be triggered by useEffect
    }
  }

  const handleNewGame = () => {
    navigate('/dragon-quiz/setup')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  // Player selection screen for team mode
  if (gamePhase === 'selectPlayer' && gameMode === 'teams') {
    const currentTeam = teams[currentPlayerIndex]
    return (
      <div className="game-screen">
        <div className="game-content">
          <div className="player-selection-container">
            <h2 className="selection-title">TURNO DI</h2>
            <h1 className="team-name">{currentTeam.name}</h1>
            <p className="selection-subtitle">Chi risponde a questa domanda?</p>

            <div className="difficulty-info">
              <span className="difficulty-label">Livello</span>
              <span className="difficulty-value">
                {getCurrentDifficultyLevel()}/10
              </span>
              <span className="difficulty-name">
                {
                  QUIZ_CONFIG.DIFFICULTY_LEVELS[getCurrentDifficultyLevel() - 1]
                    ?.name
                }
              </span>
            </div>

            <div className="team-players-selection">
              {currentTeam.players.map((player, index) => (
                <button
                  key={index}
                  className="player-selection-button"
                  onClick={() => handlePlayerSelection(index)}
                >
                  <span className="player-icon">👤</span>
                  <span className="player-name">{player}</span>
                </button>
              ))}
            </div>

            <div className="question-progress">
              Domanda {currentQuestionNumber} di {QUIZ_CONFIG.NUM_QUESTIONS}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gamePhase === 'loading') {
    return (
      <div className="game-screen">
        <div className="game-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Generazione domanda AI...</p>
            <p className="loading-subtext">
              Livello {getCurrentDifficultyLevel()}/10 -{' '}
              {
                QUIZ_CONFIG.DIFFICULTY_LEVELS[getCurrentDifficultyLevel() - 1]
                  ?.name
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (gamePhase === 'error') {
    return (
      <div className="game-screen">
        <div className="game-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{loadingError}</p>
            <button
              className="action-button primary"
              onClick={loadNextQuestion}
            >
              RIPROVA
            </button>
            <button
              className="action-button secondary"
              onClick={handleBackToHome}
            >
              TORNA AL MENU
            </button>
          </div>
        </div>
      </div>
    )
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
                  {index === 0
                    ? '🏆'
                    : index === 1
                    ? '🥈'
                    : index === 2
                    ? '🥉'
                    : `#${index + 1}`}
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
            <button
              className="action-button secondary"
              onClick={handleBackToHome}
            >
              MENU PRINCIPALE
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="game-screen">
        <div className="game-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Caricamento...</p>
          </div>
        </div>
      </div>
    )
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  // Get difficulty styling
  const difficultyLevel = currentQuestion.difficultyLevel || 1
  const difficultyData =
    QUIZ_CONFIG.DIFFICULTY_LEVELS.find((d) => d.level === difficultyLevel) ||
    QUIZ_CONFIG.DIFFICULTY_LEVELS[0]

  const totalQuestionsForProgress = QUIZ_CONFIG.NUM_QUESTIONS * numPlayers
  const answeredCount =
    (currentQuestionNumber - 1) * numPlayers + currentPlayerIndex

  return (
    <div className="game-screen">
      <div className="game-content">
        <div className="game-header">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(answeredCount / totalQuestionsForProgress) * 100}%`,
              }}
            ></div>
          </div>
          <div className="header-info">
            <span className="question-number">
              ROUND {currentQuestionNumber}/{QUIZ_CONFIG.NUM_QUESTIONS}
            </span>
            <span className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
        </div>

        <div className="current-player-section">
          <h3 className="player-label">TURNO DI</h3>
          <h2 className="player-name">{playerNames[currentPlayerIndex]}</h2>
          {gameMode === 'teams' && selectedPlayerInTeam !== null && (
            <p className="team-player-name">
              👤 {teams[currentPlayerIndex].players[selectedPlayerInTeam]}
            </p>
          )}
        </div>

        <div className="question-section">
          <div
            className="difficulty-badge-new"
            style={{
              borderColor: difficultyData.color,
              color: difficultyData.color,
            }}
          >
            <span className="difficulty-level">Lv.{difficultyLevel}</span>
            <span className="difficulty-name">{difficultyData.name}</span>
          </div>
          <div className="category-badge">{currentQuestion.category}</div>
          <h2 className="question-text">{currentQuestion.question}</h2>
        </div>

        {!showResult ? (
          <div className="answers-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className="answer-button"
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>
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
              <strong>Risposta corretta:</strong>{' '}
              {currentQuestion.options[currentQuestion.correctAnswer]}
            </div>

            {currentQuestion.explanation && (
              <div className="explanation">
                <strong>Spiegazione:</strong>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}

            {isCorrect && (
              <div className="points-breakdown">
                <div className="points-earned">
                  +
                  {(() => {
                    const basePoints = QUIZ_CONFIG.POINTS_BASE
                    const difficultyLevel = currentQuestion.difficultyLevel || 1
                    const difficultyData = QUIZ_CONFIG.DIFFICULTY_LEVELS.find(
                      (d) => d.level === difficultyLevel
                    )
                    const difficultyMultiplier = difficultyData
                      ? difficultyData.multiplier
                      : 1
                    const timeBonus = Math.floor(
                      (timeLeft / QUIZ_CONFIG.TIME_PER_QUESTION) *
                        QUIZ_CONFIG.TIME_BONUS_MAX
                    )
                    return (
                      Math.floor(basePoints * difficultyMultiplier) + timeBonus
                    )
                  })()}{' '}
                  punti
                </div>
                <div className="points-detail">
                  Base: {QUIZ_CONFIG.POINTS_BASE} × {difficultyData.multiplier}x
                  + Tempo:{' '}
                  {Math.floor(
                    (timeLeft / QUIZ_CONFIG.TIME_PER_QUESTION) *
                      QUIZ_CONFIG.TIME_BONUS_MAX
                  )}
                </div>
              </div>
            )}

            <button className="next-button" onClick={handleNextQuestion}>
              {currentQuestionNumber >= QUIZ_CONFIG.NUM_QUESTIONS &&
              currentPlayerIndex >= numPlayers - 1
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
                className={`score-chip ${
                  index === currentPlayerIndex ? 'active' : ''
                }`}
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
