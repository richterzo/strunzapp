import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRandomWords, getRandomWordsWithAI } from '../data/intesaWords'
import openaiService from '../services/openaiService'
import { getUsedWords, saveWord } from '../utils/wordsMemory'
import './IntesaVincenteGameScreen.css'

export default function IntesaVincenteGameScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pairs, timePerRound, difficulty, categories, passLimit } =
    location.state || {}

  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [currentPlayer, setCurrentPlayer] = useState(1) // 1 or 2
  const [words, setWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timePerRound)
  const [gamePhase, setGamePhase] = useState('instructions') // instructions, ready, playing, roundEnd, final
  const [scores, setScores] = useState(Array(pairs.length).fill(0))
  const [currentRoundScore, setCurrentRoundScore] = useState(0)
  const [isWordVisible, setIsWordVisible] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [showCountdown, setShowCountdown] = useState(false)
  const [passesUsed, setPassesUsed] = useState(0)
  const timerRef = useRef(null)
  const countdownRef = useRef(null)

  const currentPair = pairs[currentPairIndex]
  const currentWord = words[currentWordIndex]

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }

    // Generate initial pool of words (100 words) - try AI first
    const loadInitialWords = async () => {
      const historicalWords = getUsedWords('intesa')
      console.log(`📚 Intesa: Caricate ${historicalWords.length} parole dalla cronologia`)
      
      const generatedWords = await getRandomWordsWithAI(
        categories,
        difficulty,
        100,
        openaiService,
        historicalWords.map(w => w) // Pass historical words to avoid
      )
      setWords(generatedWords)
    }
    loadInitialWords()
  }, [currentPairIndex])

  // Auto-generate more words when running low
  useEffect(() => {
    if (words.length > 0 && currentWordIndex >= words.length - 10) {
      const loadMoreWords = async () => {
        const historicalWords = getUsedWords('intesa')
        const moreWords = await getRandomWordsWithAI(
          categories,
          difficulty,
          50,
          openaiService,
          historicalWords.map(w => w)
        )
        setWords((prev) => [...prev, ...moreWords])
      }
      loadMoreWords()
    }
  }, [currentWordIndex, words.length, categories, difficulty])

  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      handleTimeUp()
    }

    return () => {
      clearTimeout(timerRef.current)
      clearInterval(countdownRef.current)
    }
  }, [timeLeft, gamePhase])

  const handleStartRound = async () => {
    setGamePhase('ready')
    setCurrentRoundScore(0)
    setCurrentWordIndex(0)
    setTimeLeft(timePerRound)
    setPassesUsed(0) // Reset passes

    // Generate initial pool of words (100 words) - try AI first
    const historicalWords = getUsedWords('intesa')
    const generatedWords = await getRandomWordsWithAI(
      categories,
      difficulty,
      100,
      openaiService,
      historicalWords.map(w => w)
    )
    setWords(generatedWords)
  }

  const handleReady = () => {
    setShowCountdown(true)
    setCountdown(3)

    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          setTimeout(() => {
            setShowCountdown(false)
            setGamePhase('playing')
            setIsWordVisible(true)
          }, 800) // Wait a bit after "VIA!"
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCorrect = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Save word to history
    if (currentWord && currentWord.word) {
      saveWord('intesa', currentWord.word)
    }

    setCurrentRoundScore((prev) => prev + 1)
    setCurrentWordIndex((prev) => prev + 1)
  }

  const handleSkip = () => {
    if (passLimit !== 'unlimited' && passesUsed >= passLimit) {
      return // No more passes available
    }

    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }

    setPassesUsed((prev) => prev + 1)
    setCurrentWordIndex((prev) => prev + 1)
  }

  const handleTimeUp = () => {
    clearTimeout(timerRef.current)
    setGamePhase('roundEnd')

    // Update score
    const newScores = [...scores]
    newScores[currentPairIndex] += currentRoundScore
    setScores(newScores)
  }

  const handleNextPair = () => {
    if (currentPairIndex >= pairs.length - 1) {
      setGamePhase('final')
    } else {
      setCurrentPairIndex((prev) => prev + 1)
      setGamePhase('instructions')
      setIsWordVisible(false)
    }
  }

  const handleNewGame = () => {
    navigate('/intesa-vincente/setup')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (gamePhase === 'instructions') {
    return (
      <div className="intesa-game-screen">
        <div className="intesa-game-content">
          <h1 className="intesa-game-title">COPPIA {currentPairIndex + 1}</h1>
          <div className="pair-players">
            <div className="player-box player1">
              <span className="player-icon">👤</span>
              <span className="player-name">{currentPair.player1}</span>
            </div>
            <span className="plus-sign">+</span>
            <div className="player-box player2">
              <span className="player-icon">👤</span>
              <span className="player-name">{currentPair.player2}</span>
            </div>
          </div>

          <div className="instructions-box">
            <h3 className="instructions-title">📺 REGOLE DEL GIOCO</h3>
            <ul className="instructions-list">
              <li>
                👤 <strong>{currentPair.player1}</strong> tiene il telefono e fa
                indovinare
              </li>
              <li>
                🎯 <strong>{currentPair.player2}</strong> deve indovinare le
                parole
              </li>
              <li>
                ⏱️ Avete <strong>{timePerRound} secondi</strong> per fare
                RECORD!
              </li>
              {passLimit !== 'unlimited' && (
                <li>
                  ⚠️ Avete solo <strong>{passLimit} PASSA</strong> disponibili!
                </li>
              )}
            </ul>

            <div className="rules-allowed">
              <h4 className="rules-subtitle">✅ PUOI:</h4>
              <p>
                • Usare <strong>sinonimi</strong> e <strong>perifrasi</strong>
              </p>
              <p>
                • Fare <strong>gesti</strong> e <strong>mimiche</strong>
              </p>
              <p>
                • Dare <strong>indizi</strong> e <strong>descrizioni</strong>
              </p>
            </div>

            <div className="rules-forbidden">
              <h4 className="rules-subtitle">❌ NON PUOI:</h4>
              <p>
                • Dire parole <strong>contenute</strong> nella parola
              </p>
              <p>
                • Dire parole <strong>derivate</strong> o{' '}
                <strong>traduzioni</strong>
              </p>
              <p>
                • Fare <strong>assonanze</strong> o <strong>rime</strong>
              </p>
            </div>

            <div className="controls-info">
              <p>
                Premi <strong>✓ CORRETTO</strong> se indovina
              </p>
              <p>
                Premi <strong>→ PASSA</strong> per saltare
              </p>
            </div>
          </div>

          <button className="big-action-button" onClick={handleStartRound}>
            INIZIA TURNO
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'ready' || showCountdown) {
    if (showCountdown) {
      return (
        <div className="intesa-game-screen countdown-screen">
          <div className="intesa-game-content">
            <div className="countdown-animation">
              {countdown > 0 ? (
                <h1 className="countdown-big">{countdown}</h1>
              ) : (
                <h1 className="countdown-via">VIA!</h1>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="intesa-game-screen">
        <div className="intesa-game-content ready-screen">
          <h1 className="ready-title">PRONTI?</h1>
          <p className="ready-subtitle">
            {currentPair.player1}, tieni il telefono in modo che{' '}
            {currentPair.player2} non veda
          </p>
          <p className="ready-instruction">📺 Come nella trasmissione TV!</p>
          <button className="big-action-button" onClick={handleReady}>
            INIZIA IL COUNTDOWN!
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'playing') {
    const passesRemaining =
      passLimit === 'unlimited' ? null : passLimit - passesUsed
    const canPass = passLimit === 'unlimited' || passesUsed < passLimit

    return (
      <div className="intesa-game-screen playing">
        <div className="game-header-bar">
          <div className="timer-display">
            <span className={`timer-value ${timeLeft <= 10 ? 'warning' : ''}`}>
              {timeLeft}
            </span>
          </div>
          <div className="score-display">
            <span className="score-label">RECORD:</span>
            <span className="score-value">{currentRoundScore}</span>
            <span className="score-fire">🔥</span>
          </div>
        </div>

        {passLimit !== 'unlimited' && (
          <div className="passes-display">
            <span className="passes-label">PASSA RIMASTI:</span>
            <div className="passes-icons">
              {[...Array(passLimit)].map((_, i) => (
                <span
                  key={i}
                  className={`pass-icon ${i < passesUsed ? 'used' : ''}`}
                >
                  {i < passesUsed ? '✗' : '→'}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="word-display-container">
          <div className="category-tag">{currentWord.category}</div>
          <h1 className="main-word">{currentWord.word}</h1>
        </div>

        <div className="action-buttons-row">
          <button
            className={`skip-button ${!canPass ? 'disabled' : ''}`}
            onClick={handleSkip}
            disabled={!canPass}
          >
            <span className="button-icon">→</span>
            <span className="button-label">
              {canPass ? 'PASSA' : 'NO PASSA'}
            </span>
          </button>
          <button className="correct-button" onClick={handleCorrect}>
            <span className="button-icon">✓</span>
            <span className="button-label">CORRETTO</span>
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'roundEnd') {
    return (
      <div className="intesa-game-screen">
        <div className="intesa-game-content">
          <div className="round-result">
            <h1 className="result-title">TEMPO SCADUTO!</h1>
            <div className="result-score-box">
              <span className="result-score">{currentRoundScore}</span>
              <span className="result-label">parole indovinate</span>
            </div>

            <div className="pair-result">
              <span className="pair-names">
                {currentPair.player1} + {currentPair.player2}
              </span>
              <span className="pair-total">
                Totale: {scores[currentPairIndex]} punti
              </span>
            </div>
          </div>

          <button className="big-action-button" onClick={handleNextPair}>
            {currentPairIndex >= pairs.length - 1
              ? 'CLASSIFICA FINALE'
              : 'PROSSIMA COPPIA'}
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'final') {
    const rankings = pairs
      .map((pair, index) => ({
        pair: `${pair.player1} + ${pair.player2}`,
        score: scores[index],
        index,
      }))
      .sort((a, b) => b.score - a.score)

    return (
      <div className="intesa-game-screen">
        <div className="intesa-game-content">
          <h1 className="final-title">CLASSIFICA FINALE</h1>

          <div className="rankings-list">
            {rankings.map((rank, index) => (
              <div
                key={rank.index}
                className={`ranking-item rank-${index + 1}`}
              >
                <div className="rank-position">
                  {index === 0
                    ? '🏆'
                    : index === 1
                    ? '🥈'
                    : index === 2
                    ? '🥉'
                    : `#${index + 1}`}
                </div>
                <div className="rank-details">
                  <span className="rank-pair-name">{rank.pair}</span>
                  <span className="rank-score">{rank.score} parole</span>
                </div>
              </div>
            ))}
          </div>

          <div className="final-buttons">
            <button className="big-action-button" onClick={handleNewGame}>
              NUOVA PARTITA
            </button>
            <button className="secondary-button" onClick={handleBackToHome}>
              MENU PRINCIPALE
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
