import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import StronzoSetupScreen from './screens/StronzoSetupScreen'
import StronzoGameScreen from './screens/StronzoGameScreen'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/stronzo/setup" element={<StronzoSetupScreen />} />
        <Route path="/stronzo/game" element={<StronzoGameScreen />} />
      </Routes>
    </Router>
  )
}

export default App

