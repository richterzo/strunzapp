import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import './StrunzateSetupScreen.css'

export default function StrunzateSetupScreen() {
  const navigate = useNavigate()
  const [numQuestions, setNumQuestions] = useState(10)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [error, setError] = useState('')

  const categories = [
    { id: 'personali', name: 'Personali', icon: '💭', description: 'Domande intime e personali' },
    { id: 'filosofiche', name: 'Filosofiche', icon: '🤔', description: 'Riflessioni profonde sulla vita' },
    { id: 'scottanti', name: 'Scottanti', icon: '🔥', description: 'Domande provocatorie e audaci' },
    { id: 'scomode', name: 'Scomode', icon: '😬', description: 'Domande imbarazzanti' },
  ]

  const handleNumQuestionsChange = (delta) => {
    const newNum = Math.max(5, Math.min(30, numQuestions + delta))
    setNumQuestions(newNum)
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleStartGame = () => {
    if (selectedCategories.length === 0) {
      setError('Seleziona almeno una categoria')
      return
    }

    if (!openaiService.isConfigured()) {
      setError("⚠️ Servizio non disponibile. Contatta l'amministratore.")
      return
    }

    setError('')

    // Navigate to game
    navigate('/strunzate/game', {
      state: {
        numQuestions,
        categories: selectedCategories,
      },
    })
  }

  return (
    <div className="setup-screen">
      <div className="setup-content">
        <button className="back-button" onClick={() => navigate('/')}>
          ← INDIETRO
        </button>

        <div className="game-header">
          <h1 className="setup-title">STRUNZATE</h1>
          <p className="setup-subtitle">Domande per conversazioni profonde</p>
        </div>

        <div className="rules-box">
          <h3 className="rules-title">💬 COME SI GIOCA</h3>
          <ul className="rules-list">
            <li>
              🎯 Domande generate dall'AI per <strong>conversazioni autentiche</strong>
            </li>
            <li>
              🗣️ Leggi la domanda ad alta voce e <strong>rispondi onestamente</strong>
            </li>
            <li>
              👥 Perfetto per <strong>conoscersi meglio</strong> con amici, coppia, famiglia
            </li>
            <li>
              💡 Non ci sono risposte giuste o sbagliate, solo <strong>autenticità</strong>
            </li>
            <li>
              🔥 Più coraggioso sei, più <strong>profonda</strong> sarà la conversazione
            </li>
          </ul>
        </div>

        {/* Number of Questions */}
        <div className="setup-section">
          <h3 className="section-title">NUMERO DOMANDE</h3>
          <div className="num-questions-container">
            <button 
              className="num-button" 
              onClick={() => handleNumQuestionsChange(-5)}
            >
              -
            </button>
            <span className="num-display">{numQuestions}</span>
            <button 
              className="num-button" 
              onClick={() => handleNumQuestionsChange(5)}
            >
              +
            </button>
          </div>
          <p className="section-hint">Da 5 a 30 domande</p>
        </div>

        {/* Categories */}
        <div className="setup-section">
          <h3 className="section-title">CATEGORIE</h3>
          <p className="section-subtitle">Seleziona almeno una categoria</p>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${
                  selectedCategories.includes(category.id) ? 'active' : ''
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <h4 className="category-name">{category.name}</h4>
                <p className="category-description">{category.description}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="start-button" onClick={handleStartGame}>
          INIZIA CONVERSAZIONE
        </button>
      </div>
    </div>
  )
}

