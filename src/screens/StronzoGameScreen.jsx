import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import { getUsedWords, saveWord } from '../utils/wordsMemory'
import './StronzoGameScreen.css'

export default function StronzoGameScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { numPlayers, playerNames, categories, numStronzi, allWords } =
    location.state || {}

  const [stronzi, setStronzi] = useState([])
  const [currentWord, setCurrentWord] = useState('')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState('setup') // setup, playing, reveal
  const [revealedPlayers, setRevealedPlayers] = useState([])
  const [roundNumber, setRoundNumber] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [usedWords, setUsedWords] = useState([])
  const [isWordHidden, setIsWordHidden] = useState(false)

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }

    const initGame = async () => {
      // Seleziona casualmente gli stronzi
      const players = Array.from({ length: numPlayers }, (_, i) => i)
      const shuffled = [...players].sort(() => Math.random() - 0.5)
      const selectedStronzi = shuffled.slice(0, numStronzi)
      setStronzi(selectedStronzi)

      // Get historical words to avoid
      const historicalWords = getUsedWords('stronzo')
      console.log(
        `📚 Stronzo: Caricate ${historicalWords.length} parole dalla cronologia`
      )

      // Try to get word from AI first
      let word = null
      if (openaiService.isConfigured()) {
        try {
          const categoryName =
            categories && categories.length > 0 ? categories[0] : 'Generale'
          const aiWords = await openaiService.generatePartyWords(
            categoryName,
            'medio',
            1,
            'stronzo'
          )
          if (
            aiWords &&
            aiWords.length > 0 &&
            !historicalWords.includes(aiWords[0])
          ) {
            word = aiWords[0]
          }
        } catch (error) {
          console.warn('Generazione parola fallita, uso fallback')
        }
      }

      // Fallback to static words if AI failed
      if (!word) {
        const availableWords = allWords.filter(
          (w) => !historicalWords.includes(w)
        )
        const wordsToUse = availableWords.length > 0 ? availableWords : allWords
        word = wordsToUse[Math.floor(Math.random() * wordsToUse.length)]
      }

      // Save to history
      saveWord('stronzo', word)

      setCurrentWord(word)
      setUsedWords([word])
      setIsWordHidden(true)
      setGamePhase('playing')

      console.log(`✅ Stronzo: Parola selezionata "${word}"`)
    }

    initGame()
  }, [])

  const handlePlayerSeen = (playerIndex) => {
    if (gamePhase !== 'playing' || isTransitioning) return

    // Vibrazione se supportata
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    setIsTransitioning(true)
    const newRevealed = [...revealedPlayers, playerIndex]
    setRevealedPlayers(newRevealed)

    // Se tutti hanno visto, passa direttamente al prossimo turno
    if (newRevealed.length >= numPlayers) {
      setTimeout(() => {
        nextRound()
      }, 800)
    } else {
      // Passa al prossimo giocatore che non ha ancora visto
      setTimeout(() => {
        let nextIndex = (playerIndex + 1) % numPlayers
        while (
          newRevealed.includes(nextIndex) &&
          newRevealed.length < numPlayers
        ) {
          nextIndex = (nextIndex + 1) % numPlayers
        }
        setCurrentPlayerIndex(nextIndex)
        setIsWordHidden(true) // Nascondi la parola per il nuovo giocatore
        setIsTransitioning(false)
      }, 500)
    }
  }

  const nextRound = async () => {
    let newWord = null

    // Get all used words (session + history)
    const historicalWords = getUsedWords('stronzo')
    const allUsedWords = [...new Set([...usedWords, ...historicalWords])]

    // Try AI first
    if (openaiService.isConfigured()) {
      try {
        const categoryName =
          categories && categories.length > 0
            ? categories[Math.floor(Math.random() * categories.length)]
            : 'Generale'
        const aiWords = await openaiService.generatePartyWords(
          categoryName,
          'medio',
          1,
          'stronzo'
        )
        if (
          aiWords &&
          aiWords.length > 0 &&
          !allUsedWords.includes(aiWords[0])
        ) {
          newWord = aiWords[0]
        }
      } catch (error) {
        console.warn('Generazione parola fallita, uso fallback')
      }
    }

    // Fallback to static words if AI failed
    if (!newWord) {
      let availableWords = allWords.filter((w) => !allUsedWords.includes(w))
      if (availableWords.length === 0) {
        // If all words used, reset and use all
        availableWords = allWords
      }
      newWord =
        availableWords[Math.floor(Math.random() * availableWords.length)]
    }

    // Save to history
    saveWord('stronzo', newWord)

    setCurrentWord(newWord)
    setUsedWords((prev) => [...prev, newWord].slice(-10))
    setCurrentPlayerIndex(0)
    setRevealedPlayers([])
    setRoundNumber((prev) => prev + 1)
    setIsWordHidden(true)
    setGamePhase('playing')

    // Vibrazione se supportata
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    console.log(
      `✅ Stronzo Round ${roundNumber + 1}: Nuova parola "${newWord}"`
    )
  }

  const isStronzo = (playerIndex) => {
    return stronzi.includes(playerIndex)
  }

  if (gamePhase === 'setup') {
    return (
      <div className="game-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Preparazione gioco...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen">
      <div className="game-content">
        <div className="game-header">
          <span className="round-badge">TURNO {roundNumber}</span>
          <span className="progress-indicator">
            {revealedPlayers.length} / {numPlayers}
          </span>
        </div>

        <div className="current-player-section">
          <h3 className="current-player-label">TURNO DI</h3>
          <h2
            className={`current-player-name ${
              isTransitioning ? 'fade-out' : 'fade-in'
            }`}
          >
            {playerNames[currentPlayerIndex]}
          </h2>
        </div>

        <div
          className={`word-section ${isTransitioning ? 'transitioning' : ''} ${
            isWordHidden ? 'hidden' : ''
          }`}
        >
          {isStronzo(currentPlayerIndex) ? (
            <div className="stronzo-view">
              {isWordHidden ? (
                <div className="word-hidden">
                  <p className="hide-hint">👆 TOCCA PER MOSTRARE</p>
                  <button
                    className="reveal-word-button"
                    onClick={() => setIsWordHidden(false)}
                    onTouchStart={() => setIsWordHidden(false)}
                  >
                    MOSTRA INDIZIO
                  </button>
                </div>
              ) : (
                <div className="stronzo-revealed">
                  <img
                    src="/images/games/impostore.png"
                    alt="Stronzo Impostore"
                    className="stronzo-logo"
                  />
                  <p className="stronzo-hint">
                    Non sai la parola. Fingi di saperla!
                  </p>
                  <p className="stronzo-warning">⚠️ Non farti scoprire!</p>
                  <button
                    className="hide-word-button"
                    onClick={() => setIsWordHidden(true)}
                    onTouchStart={() => setIsWordHidden(true)}
                  >
                    👁️ NASCONDI
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="word-view">
              <p className="word-label">LA PAROLA È:</p>
              {isWordHidden ? (
                <div className="word-hidden">
                  <p className="hide-hint">👆 TOCCA PER MOSTRARE</p>
                  <button
                    className="reveal-word-button"
                    onClick={() => setIsWordHidden(false)}
                    onTouchStart={() => setIsWordHidden(false)}
                  >
                    MOSTRA PAROLA
                  </button>
                </div>
              ) : (
                <div>
                  <h1
                    className={`word-display ${
                      isTransitioning ? 'fade-out' : 'fade-in'
                    }`}
                  >
                    {currentWord}
                  </h1>
                  <button
                    className="hide-word-button"
                    onClick={() => setIsWordHidden(true)}
                    onTouchStart={() => setIsWordHidden(true)}
                  >
                    👁️ NASCONDI
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="action-buttons-container">
          <button
            className="seen-button"
            onClick={() => handlePlayerSeen(currentPlayerIndex)}
            disabled={isTransitioning}
          >
            HO VISTO
          </button>
          <button
            className="new-game-button"
            onClick={() => navigate('/stronzo/setup')}
          >
            NUOVA PARTITA
          </button>
        </div>

        <div className="players-list">
          <p className="players-list-title">GIOCATORI</p>
          <div className="players-grid">
            {playerNames.map((name, index) => (
              <div
                key={index}
                className={`player-chip ${
                  index === currentPlayerIndex ? 'active' : ''
                } ${revealedPlayers.includes(index) ? 'seen' : ''}`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
