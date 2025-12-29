import React from 'react'
import { useNavigate } from 'react-router-dom'
import './HomeScreen.css'

export default function HomeScreen() {
  const navigate = useNavigate()

  const games = [
    {
      id: 'stronzo',
      name: 'STRONZO',
      description: 'Trova l\'impostore',
      color: '#FF4444',
    },
    // Altri minigiochi verranno aggiunti qui
  ]

  return (
    <div className="home-screen">
      <div className="home-content">
        <h1 className="home-title">STRUNZAPP</h1>
        <p className="home-subtitle">Minigiochi</p>
        
        <div className="games-container">
          {games.map((game) => (
            <button
              key={game.id}
              className="game-card"
              onClick={() => navigate('/stronzo/setup')}
            >
              <span className="game-name">
                {game.name}
              </span>
              <span className="game-description">{game.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

