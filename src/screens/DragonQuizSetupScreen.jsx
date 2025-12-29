import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUIZ_CONFIG, GAME_MODES } from '../config/api'
import openaiService from '../services/openaiService'
import './DragonQuizSetupScreen.css'
import './shared-setup.css'

export default function DragonQuizSetupScreen() {
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState('single') // single, teams
  const [numPlayers, setNumPlayers] = useState(1)
  const [numTeams, setNumTeams] = useState(2)
  const [playerNames, setPlayerNames] = useState([''])
  const [teamNames, setTeamNames] = useState(['Squadra 1', 'Squadra 2'])
  const [teams, setTeams] = useState([
    { name: 'Squadra 1', players: ['Giocatore 1'] },
    { name: 'Squadra 2', players: ['Giocatore 2'] },
  ])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [comboEnabled, setComboEnabled] = useState(true)
  const [error, setError] = useState('')
  const [rulesOpen, setRulesOpen] = useState(false)

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
    setTeams(
      Array.from(
        { length: newNum },
        (_, i) =>
          teams[i] || {
            name: `Squadra ${i + 1}`,
            players: [`Giocatore ${i + 1}`],
          }
      )
    )
  }

  const handleTeamNameChangeNew = (teamIndex, value) => {
    const newTeams = [...teams]
    newTeams[teamIndex].name = value
    setTeams(newTeams)
  }

  const handleTeamPlayerNameChange = (teamIndex, playerIndex, value) => {
    const newTeams = [...teams]
    newTeams[teamIndex].players[playerIndex] = value
    setTeams(newTeams)
  }

  const addPlayerToTeam = (teamIndex) => {
    const newTeams = [...teams]
    const playerNum = newTeams[teamIndex].players.length + 1
    newTeams[teamIndex].players.push(`Giocatore ${playerNum}`)
    setTeams(newTeams)
  }

  const removePlayerFromTeam = (teamIndex, playerIndex) => {
    const newTeams = [...teams]
    if (newTeams[teamIndex].players.length > 1) {
      newTeams[teamIndex].players.splice(playerIndex, 1)
      setTeams(newTeams)
    }
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

    if (gameMode === 'teams') {
      if (teams.length < 2) {
        setError('Servono almeno 2 squadre')
        return
      }
      // Check that each team has at least 1 player
      const emptyTeams = teams.filter((team) => team.players.length === 0)
      if (emptyTeams.length > 0) {
        setError('Ogni squadra deve avere almeno 1 giocatore')
        return
      }
    }

    if (!openaiService.isConfigured()) {
      setError("⚠️ Servizio non disponibile. Contatta l'amministratore.")
      return
    }

    setError('')

    // Navigate to game - questions will be generated on-demand
    navigate('/dragon-quiz/game', {
      state: {
        gameMode,
        numPlayers: gameMode === 'single' ? numPlayers : teams.length,
        playerNames:
          gameMode === 'single' ? playerNames : teams.map((t) => t.name),
        teams: gameMode === 'teams' ? teams : null,
        categories:
          selectedCategories.length > 0
            ? selectedCategories
            : QUIZ_CONFIG.CATEGORIES,
        timerEnabled,
        comboEnabled,
      },
    })
  }

  return (
    <div className="setup-screen">
      <div className="setup-content">
        <button className="back-button" onClick={() => navigate('/')}>
          BACK
        </button>

        <div className="game-header">
          <img
            src="/images/games/dragonquiz.png"
            alt="Dragon Quiz"
            className="game-logo"
          />
        </div>

        <button
          className="rules-toggle"
          onClick={() => setRulesOpen(!rulesOpen)}
        >
          <span className="rules-toggle-icon">{rulesOpen ? '▼' : '▶'}</span>
          <span className="rules-toggle-text">COME SI GIOCA</span>
        </button>

        {rulesOpen && (
          <div className="rules-box">
            <ul className="rules-list">
              <li>
                🎯 <strong>10 domande</strong> a difficoltà crescente (1-10)
              </li>
              <li>
                ⏱️ <strong>30 secondi</strong> per rispondere
              </li>
              <li>
                📈 Più difficile = <strong>più punti</strong>
              </li>
              <li>
                ⚡ Rispondi veloce per <strong>bonus tempo</strong>
              </li>
              <li>
                🏆 Arriva al livello <strong>DRAGONE</strong>!
              </li>
            </ul>
          </div>
        )}

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
            <h3 className="section-title">SQUADRE E GIOCATORI</h3>
            <div className="teams-container">
              {teams.map((team, teamIndex) => (
                <div key={teamIndex} className="team-config">
                  <input
                    type="text"
                    className="team-name-input"
                    placeholder={`Squadra ${teamIndex + 1}`}
                    value={team.name}
                    onChange={(e) =>
                      handleTeamNameChangeNew(teamIndex, e.target.value)
                    }
                  />
                  <div className="team-players">
                    {team.players.map((player, playerIndex) => (
                      <div key={playerIndex} className="team-player-row">
                        <input
                          type="text"
                          className="team-player-input"
                          placeholder={`Giocatore ${playerIndex + 1}`}
                          value={player}
                          onChange={(e) =>
                            handleTeamPlayerNameChange(
                              teamIndex,
                              playerIndex,
                              e.target.value
                            )
                          }
                        />
                        {team.players.length > 1 && (
                          <button
                            className="remove-player-button"
                            onClick={() =>
                              removePlayerFromTeam(teamIndex, playerIndex)
                            }
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      className="add-player-button"
                      onClick={() => addPlayerToTeam(teamIndex)}
                    >
                      + Aggiungi Giocatore
                    </button>
                  </div>
                </div>
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

        {/* Game Options */}
        <div className="setup-section">
          <h3 className="section-title">⚙️ OPZIONI DI GIOCO</h3>
          <div className="game-options-grid">
            <div className="option-card">
              <div className="option-header">
                <span className="option-icon">⏱️</span>
                <div className="option-info">
                  <h4 className="option-name">TIMER</h4>
                  <p className="option-description">
                    30 secondi per rispondere
                  </p>
                </div>
              </div>
              <button
                className={`toggle-button ${timerEnabled ? 'active' : ''}`}
                onClick={() => setTimerEnabled(!timerEnabled)}
              >
                {timerEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="option-card">
              <div className="option-header">
                <span className="option-icon">🔥</span>
                <div className="option-info">
                  <h4 className="option-name">COMBO</h4>
                  <p className="option-description">
                    Moltiplicatore per risposte consecutive
                  </p>
                </div>
              </div>
              <button
                className={`toggle-button ${comboEnabled ? 'active' : ''}`}
                onClick={() => setComboEnabled(!comboEnabled)}
              >
                {comboEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button className="start-button" onClick={handleStartGame}>
          INIZIA QUIZ
        </button>

        <div className="quiz-info">
          <p>🎯 10 domande • 📈 Difficoltà crescente • 🐉 Sfida il Dragone</p>
        </div>
      </div>
    </div>
  )
}
