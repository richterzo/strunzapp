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
      image: '/images/games/impostore.png',
    },
    {
      id: 'dragon-quiz',
      name: 'DRAGON QUIZ',
      description: 'Quiz AI con difficoltà crescente',
      route: '/dragon-quiz/setup',
      image: '/images/games/dragonquiz.png',
    },
    {
      id: 'intesa-vincente',
      name: 'MERDA VINCENTE',
      description: 'Fai indovinare le parole al tuo compagno',
      route: '/intesa-vincente/setup',
      image: '/images/games/merda-vincente.png',
    },
  ]

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="logo-container">
          <img 
            src="/images/logo.png" 
            alt="StrunzApp Logo" 
            className="app-logo"
          />
        </div>
        
        <div className="games-container">
          {games.map((game) => (
            <button
              key={game.id}
              className="game-card"
              onClick={() => navigate(game.route)}
            >
              <img 
                src={game.image} 
                alt={game.name} 
                className="game-image"
              />
              <div className="game-info">
                <span className="game-name">
                  {game.name}
                </span>
                <span className="game-description">{game.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

