import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import StronzoSetupScreen from './screens/StronzoSetupScreen'
import StronzoGameScreen from './screens/StronzoGameScreen'
import DragonQuizSetupScreen from './screens/DragonQuizSetupScreen'
import DragonQuizGameScreen from './screens/DragonQuizGameScreen'
import IntesaVincenteSetupScreen from './screens/IntesaVincenteSetupScreen'
import IntesaVincenteGameScreen from './screens/IntesaVincenteGameScreen'
import StrunzateSetupScreen from './screens/StrunzateSetupScreen'
import StrunzateGameScreen from './screens/StrunzateGameScreen'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/stronzo/setup" element={<StronzoSetupScreen />} />
        <Route path="/stronzo/game" element={<StronzoGameScreen />} />
        <Route path="/dragon-quiz/setup" element={<DragonQuizSetupScreen />} />
        <Route path="/dragon-quiz/game" element={<DragonQuizGameScreen />} />
        <Route path="/intesa-vincente/setup" element={<IntesaVincenteSetupScreen />} />
        <Route path="/intesa-vincente/game" element={<IntesaVincenteGameScreen />} />
        <Route path="/strunzate/setup" element={<StrunzateSetupScreen />} />
        <Route path="/strunzate/game" element={<StrunzateGameScreen />} />
      </Routes>
    </Router>
  )
}

export default App

