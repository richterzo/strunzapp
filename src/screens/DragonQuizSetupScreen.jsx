import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUIZ_CONFIG, GAME_MODES } from '../config/api'
import openaiService from '../services/openaiService'
import './DragonQuizSetupScreen.css'

export default function DragonQuizSetupScreen() {
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState('single') // single, teams
  const [numPlayers, setNumPlayers] = useState(1)
  const [numTeams, setNumTeams] = useState(2)
  const [playerNames, setPlayerNames] = useState([''])
  const [teamNames, setTeamNames] = useState(['Squadra 1', 'Squadra 2'])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNumPlayersChange = (delta) => {
    const newNum = Math.max(1, Math.min(10, numPlayers + delta))
    setNumPlayers(newNum)
    setPlayerNames(
      Array.from(
        { length: newNum },
        (_, i) => playerNames[i] || `Giocatore ${i + 1}`
      )
    )
  }

  const handleNumTeamsChange = (delta) => {
    const newNum = Math.max(2, Math.min(4, numTeams + delta))
    setNumTeams(newNum)
    setTeamNames(
      Array.from(
        { length: newNum },
        (_, i) => teamNames[i] || `Squadra ${i + 1}`
      )
    )
  }

  const handlePlayerNameChange = (index, value) => {
    const newNames = [...playerNames]
    newNames[index] = value
    setPlayerNames(newNames)
  }

  const handleTeamNameChange = (index, value) => {
    const newNames = [...teamNames]
    newNames[index] = value
    setTeamNames(newNames)
  }

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleStartGame = async () => {
    // Validation
    if (gameMode === 'single' && numPlayers < 1) {
      setError('Seleziona almeno 1 giocatore')
      return
    }

    if (gameMode === 'teams' && numTeams < 2) {
      setError('Servono almeno 2 squadre')
      return
    }

    if (!openaiService.isConfigured()) {
      setError(
        '⚠️ API Key OpenAI non configurata. Aggiungi VITE_OPENAI_API_KEY al file .env'
      )
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // Generate questions
      const questions = await openaiService.generateQuizQuestions(
        QUIZ_CONFIG.TOTAL_QUESTIONS,
        selectedCategories
      )

      // Navigate to game with data
      navigate('/dragon-quiz/game', {
        state: {
          gameMode,
          numPlayers: gameMode === 'single' ? numPlayers : numTeams,
          playerNames: gameMode === 'single' ? playerNames : teamNames,
          questions,
          categories:
            selectedCategories.length > 0
              ? selectedCategories
              : QUIZ_CONFIG.CATEGORIES,
        },
      })
    } catch (err) {
      console.error('Error starting quiz:', err)
      setError(`Errore: ${err.message}`)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="setup-screen">
        <div className="setup-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Generazione domande AI...</p>
            <p className="loading-subtext">Difficoltà crescente</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="setup-screen">
      <div className="setup-content">
        <button className="back-button" onClick={() => navigate('/')}>
          ← INDIETRO
        </button>

        <h1 className="setup-title">DRAGON QUIZ</h1>

        {error && <div className="error-message">{error}</div>}

        {/* Game Mode */}
        <div className="setup-section">
          <h3 className="section-title">MODALITÀ</h3>
          <div className="mode-buttons">
            <button
              className={`mode-button ${gameMode === 'single' ? 'active' : ''}`}
              onClick={() => setGameMode('single')}
            >
              <span className="mode-icon">👤</span>
              <span>SINGOLO</span>
            </button>
            <button
              className={`mode-button ${gameMode === 'teams' ? 'active' : ''}`}
              onClick={() => setGameMode('teams')}
            >
              <span className="mode-icon">👥</span>
              <span>SQUADRE</span>
            </button>
          </div>
        </div>

        {/* Number of Players/Teams */}
        {gameMode === 'single' ? (
          <div className="setup-section">
            <h3 className="section-title">GIOCATORI</h3>
            <div className="num-players-container">
              <button
                className="num-button"
                onClick={() => handleNumPlayersChange(-1)}
              >
                −
              </button>
              <input
                type="number"
                className="num-input"
                value={numPlayers}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setNumPlayers(Math.max(1, Math.min(10, val)))
                  setPlayerNames(
                    Array.from(
                      { length: val },
                      (_, i) => playerNames[i] || `Giocatore ${i + 1}`
                    )
                  )
                }}
                min="1"
                max="10"
              />
              <button
                className="num-button"
                onClick={() => handleNumPlayersChange(1)}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="setup-section">
            <h3 className="section-title">SQUADRE</h3>
            <div className="num-players-container">
              <button
                className="num-button"
                onClick={() => handleNumTeamsChange(-1)}
              >
                −
              </button>
              <input
                type="number"
                className="num-input"
                value={numTeams}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 2
                  setNumTeams(Math.max(2, Math.min(4, val)))
                  setTeamNames(
                    Array.from(
                      { length: val },
                      (_, i) => teamNames[i] || `Squadra ${i + 1}`
                    )
                  )
                }}
                min="2"
                max="4"
              />
              <button
                className="num-button"
                onClick={() => handleNumTeamsChange(1)}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Names */}
        {gameMode === 'single' ? (
          <div className="setup-section">
            <h3 className="section-title">NOMI GIOCATORI</h3>
            <div className="names-container">
              {playerNames.map((name, index) => (
                <input
                  key={index}
                  type="text"
                  className="name-input"
                  placeholder={`Giocatore ${index + 1}`}
                  value={name}
                  onChange={(e) =>
                    handlePlayerNameChange(index, e.target.value)
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="setup-section">
            <h3 className="section-title">NOMI SQUADRE</h3>
            <div className="names-container">
              {teamNames.map((name, index) => (
                <input
                  key={index}
                  type="text"
                  className="name-input"
                  placeholder={`Squadra ${index + 1}`}
                  value={name}
                  onChange={(e) => handleTeamNameChange(index, e.target.value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="setup-section">
          <h3 className="section-title">CATEGORIE (opzionale)</h3>
          <p className="section-subtitle">
            Lascia vuoto per tutte le categorie
          </p>
          <div className="categories-container">
            {QUIZ_CONFIG.CATEGORIES.map((category) => (
              <button
                key={category}
                className={`category-button ${
                  selectedCategories.includes(category) ? 'active' : ''
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button className="start-button" onClick={handleStartGame}>
          INIZIA QUIZ
        </button>

        <div className="quiz-info">
          <p>🎯 10 domande • 📈 Difficoltà crescente • 🤖 AI-powered</p>
        </div>
      </div>
    </div>
  )
}
