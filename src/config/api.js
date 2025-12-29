// API Configuration
export const API_CONFIG = {
  // OpenAI API Key - Add your key here or use environment variable
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_MODEL: 'gpt-4o-mini', // or 'gpt-3.5-turbo' for lower cost
}

// Game modes
export const GAME_MODES = {
  SINGLE_PLAYER: 'single',
  LOCAL_MULTIPLAYER: 'local',
  ONLINE_MULTIPLAYER: 'online', // Future implementation
}

// Quiz configuration
export const QUIZ_CONFIG = {
  NUM_QUESTIONS: 10, // Number of question rounds
  
  // Difficulty scale 1-10 (like "Chi vuol essere milionario")
  DIFFICULTY_LEVELS: [
    { level: 1, name: 'Base', multiplier: 1.0, color: '#00FF00' },
    { level: 2, name: 'Facile', multiplier: 1.3, color: '#66FF00' },
    { level: 3, name: 'Medio', multiplier: 1.7, color: '#99FF00' },
    { level: 4, name: 'Avanzato', multiplier: 2.2, color: '#CCFF00' },
    { level: 5, name: 'Difficile', multiplier: 2.8, color: '#FFFF00' },
    { level: 6, name: 'Molto Difficile', multiplier: 3.5, color: '#FFCC00' },
    { level: 7, name: 'Esperto', multiplier: 4.3, color: '#FF9900' },
    { level: 8, name: 'Maestro', multiplier: 5.2, color: '#FF6600' },
    { level: 9, name: 'Impossibile', multiplier: 6.5, color: '#FF3300' },
    { level: 10, name: 'Milionario', multiplier: 8.0, color: '#FF00FF' },
  ],
  
  CATEGORIES: [
    'Storia',
    'Geografia',
    'Scienze',
    'Arte e Letteratura',
    'Cinema e TV',
    'Musica',
    'Sport',
    'Cultura Generale',
  ],
  
  TIME_PER_QUESTION: 30, // seconds
  POINTS_BASE: 100,
  TIME_BONUS_MAX: 50, // Maximum bonus for quick answers
}

