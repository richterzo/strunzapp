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
  
  // Difficulty scale 1-10 (one level per question round)
  DIFFICULTY_LEVELS: [
    { level: 1, name: 'Principiante', multiplier: 1.0, color: '#00FF00' },
    { level: 2, name: 'Facile', multiplier: 1.2, color: '#33FF33' },
    { level: 3, name: 'Base', multiplier: 1.5, color: '#66FF66' },
    { level: 4, name: 'Intermedio', multiplier: 1.8, color: '#99FF99' },
    { level: 5, name: 'Medio', multiplier: 2.2, color: '#FFFF00' },
    { level: 6, name: 'Avanzato', multiplier: 2.6, color: '#FFCC00' },
    { level: 7, name: 'Difficile', multiplier: 3.0, color: '#FF9900' },
    { level: 8, name: 'Esperto', multiplier: 3.5, color: '#FF6600' },
    { level: 9, name: 'Maestro', multiplier: 4.0, color: '#FF3300' },
    { level: 10, name: 'Leggenda', multiplier: 5.0, color: '#FF00FF' },
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

