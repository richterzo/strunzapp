import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './IntesaVincenteSetupScreen.css'
import './shared-setup.css'

export default function IntesaVincenteSetupScreen() {
  const navigate = useNavigate()
  const [numPairs, setNumPairs] = useState(1)
  const [pairs, setPairs] = useState([
    { player1: 'Giocatore 1', player2: 'Giocatore 2' },
  ])
  const [timePerRound, setTimePerRound] = useState(60)
  const [difficulty, setDifficulty] = useState('medio')
  const [categories, setCategories] = useState(['Generale'])
  const [passLimit, setPassLimit] = useState(3) // 3 or 'unlimited'
  const [rulesOpen, setRulesOpen] = useState(false)

  const CATEGORIES = [
    'Generale',
    'Animali',
    'Cibo',
    'Sport',
    'Cinema',
    'Musica',
    'Geografia',
    'Storia',
    'Scienza',
    'Arte',
    'Tecnologia',
    'Personaggi Famosi',
  ]

  const handleNumPairsChange = (delta) => {
    const newNum = Math.max(1, Math.min(6, numPairs + delta))
    setNumPairs(newNum)
    setPairs(
      Array.from(
        { length: newNum },
        (_, i) =>
          pairs[i] || {
            player1: `Giocatore ${i * 2 + 1}`,
            player2: `Giocatore ${i * 2 + 2}`,
          }
      )
    )
  }

  const handlePairNameChange = (index, field, value) => {
    const newPairs = [...pairs]
    newPairs[index][field] = value
    setPairs(newPairs)
  }

  const toggleCategory = (category) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleStartGame = () => {
    navigate('/intesa-vincente/game', {
      state: {
        pairs,
        timePerRound,
        difficulty,
        categories: categories.length > 0 ? categories : CATEGORIES,
        passLimit,
      },
    })
  }

  return (
    <div className="intesa-setup-screen">
      <div className="intesa-setup-content">
        <button className="back-button" onClick={() => navigate('/')}>
          ← INDIETRO
        </button>

        <div className="game-header">
          <img
            src="/images/games/merda-vincente.png"
            alt="Merda Vincente"
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
                👥 Un giocatore fa <strong>indovinare</strong>, l'altro{' '}
                <strong>indovina</strong>
              </li>
              <li>
                ✅ <strong>PUOI:</strong> Sinonimi, gesti, descrizioni
              </li>
              <li>
                ❌ <strong>NON PUOI:</strong> Dire la parola o sue parti
              </li>
              <li>
                ⏱️ Hai <strong>tempo limitato</strong> - vai a RECORD!
              </li>
              <li>
                → Solo <strong>3 PASSA</strong> disponibili (modalità TV)
              </li>
            </ul>
          </div>
        )}

        {/* Number of Pairs */}
        <div className="setup-section">
          <h3 className="section-title">NUMERO DI COPPIE</h3>
          <div className="counter-control">
            <button
              className="counter-button"
              onClick={() => handleNumPairsChange(-1)}
            >
              −
            </button>
            <span className="counter-value">{numPairs}</span>
            <button
              className="counter-button"
              onClick={() => handleNumPairsChange(1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Pair Names */}
        <div className="setup-section">
          <h3 className="section-title">NOMI COPPIE</h3>
          <div className="pairs-list">
            {pairs.map((pair, index) => (
              <div key={index} className="pair-input-group">
                <div className="pair-label">Coppia {index + 1}</div>
                <div className="pair-inputs">
                  <input
                    type="text"
                    className="pair-input"
                    value={pair.player1}
                    onChange={(e) =>
                      handlePairNameChange(index, 'player1', e.target.value)
                    }
                    placeholder="Giocatore 1"
                  />
                  <span className="pair-separator">+</span>
                  <input
                    type="text"
                    className="pair-input"
                    value={pair.player2}
                    onChange={(e) =>
                      handlePairNameChange(index, 'player2', e.target.value)
                    }
                    placeholder="Giocatore 2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time per Round */}
        <div className="setup-section">
          <h3 className="section-title">TEMPO PER TURNO</h3>
          <p className="section-description">
            ⏱️ Indovina più parole possibili prima dello scadere del tempo!
          </p>
          <div className="counter-control">
            <button
              className="counter-button"
              onClick={() => setTimePerRound(Math.max(30, timePerRound - 15))}
            >
              −
            </button>
            <span className="counter-value">{timePerRound}s</span>
            <button
              className="counter-button"
              onClick={() => setTimePerRound(Math.min(120, timePerRound + 15))}
            >
              +
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div className="setup-section">
          <h3 className="section-title">DIFFICOLTÀ</h3>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-button ${
                difficulty === 'facile' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('facile')}
            >
              FACILE
            </button>
            <button
              className={`difficulty-button ${
                difficulty === 'medio' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('medio')}
            >
              MEDIO
            </button>
            <button
              className={`difficulty-button ${
                difficulty === 'difficile' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('difficile')}
            >
              DIFFICILE
            </button>
          </div>
        </div>

        {/* Pass Limit */}
        <div className="setup-section">
          <h3 className="section-title">PASSA DISPONIBILI</h3>
          <p className="section-description">
            📺 Nella trasmissione TV: solo 3 passa!
          </p>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-button ${passLimit === 3 ? 'active' : ''}`}
              onClick={() => setPassLimit(3)}
            >
              3 PASSA (TV)
            </button>
            <button
              className={`difficulty-button ${
                passLimit === 'unlimited' ? 'active' : ''
              }`}
              onClick={() => setPassLimit('unlimited')}
            >
              INFINITI
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="setup-section">
          <h3 className="section-title">CATEGORIE</h3>
          <div className="categories-grid">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`category-button ${
                  categories.includes(category) ? 'active' : ''
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <button className="start-button" onClick={handleStartGame}>
          INIZIA GIOCO
        </button>
      </div>
    </div>
  )
}
