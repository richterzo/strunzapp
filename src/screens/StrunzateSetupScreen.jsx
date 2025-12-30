import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services'
import './StrunzateSetupScreen.css'
import './shared-setup.css'

export default function StrunzateSetupScreen() {
  const navigate = useNavigate()
  const [selectedCategories, setSelectedCategories] = useState(['personali'])
  const [error, setError] = useState('')
  const [rulesOpen, setRulesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(true)

  const categories = [
    { 
      id: 'personali', 
      name: 'Personali', 
      icon: '💭',
      description: 'Esperienze vissute, relazioni, emozioni'
    },
    { 
      id: 'filosofiche', 
      name: 'Filosofiche', 
      icon: '🤔',
      description: 'Etica, morale, vita, morte'
    },
    { 
      id: 'scottanti', 
      name: 'Piccanti', 
      icon: '🔥',
      description: 'Sesso, fantasie, intimità fisica'
    },
    { 
      id: 'scomode', 
      name: 'Scomode', 
      icon: '😬',
      description: 'Verità scomode e situazioni ipotetiche'
    },
  ]

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Don't allow removing if it's the last one
        if (prev.length === 1) return prev
        return prev.filter(c => c !== categoryId)
      }
      return [...prev, categoryId]
    })
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

    navigate('/strunzate/game', {
      state: {
        categories: selectedCategories,
      },
    })
  }

  return (
    <div className="strunzate-setup-screen">
      <div className="strunzate-setup-content">
        <button className="back-button" onClick={() => navigate('/')}>
          BACK
        </button>

        <div className="game-header">
          <img 
            src="/images/games/strunzate.png" 
            alt="Strunzate" 
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
              <li>🎯 Domande generate per stimolare <strong>conversazioni profonde</strong></li>
              <li>🗣️ Leggi ad alta voce e <strong>rispondi con sincerità</strong></li>
              <li>👥 Perfetto per <strong>serate tra amici, coppie, famiglia</strong></li>
              <li>💡 Non esistono risposte giuste o sbagliate</li>
              <li>🔥 Più sei autentico, più la conversazione sarà <strong>memorabile</strong></li>
            </ul>
          </div>
        )}

        <button
          className="rules-toggle"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <span className="rules-toggle-icon">{settingsOpen ? '▼' : '▶'}</span>
          <span className="rules-toggle-text">IMPOSTAZIONI</span>
        </button>

        {settingsOpen && (
          <>
        {/* Categories */}
        <div className="setup-section">
          <h3 className="section-title">CATEGORIE</h3>
          <p className="section-subtitle">Seleziona una o più categorie</p>
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
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        <button className="start-button" onClick={handleStartGame}>
          INIZIA CONVERSAZIONE
        </button>
      </div>
    </div>
  )
}
