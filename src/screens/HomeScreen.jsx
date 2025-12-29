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
      route: '/stronzo/setup',
    },
    {
      id: 'dragon-quiz',
      name: 'DRAGON QUIZ',
      description: 'Quiz AI con difficoltà crescente',
      route: '/dragon-quiz/setup',
    },
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
              onClick={() => navigate(game.route)}
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

