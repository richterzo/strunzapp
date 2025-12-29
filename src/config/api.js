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
  
  // Difficulty scale 5-10 (from Medium to Legend - HARD MODE)
  DIFFICULTY_LEVELS: [
    { level: 5, name: 'Medio', multiplier: 1.0, color: '#FFFF00' },
    { level: 6, name: 'Avanzato', multiplier: 1.3, color: '#FFCC00' },
    { level: 7, name: 'Difficile', multiplier: 1.7, color: '#FF9900' },
    { level: 8, name: 'Esperto', multiplier: 2.2, color: '#FF6600' },
    { level: 9, name: 'Maestro', multiplier: 2.8, color: '#FF3300' },
    { level: 10, name: 'Leggenda', multiplier: 3.5, color: '#FF00FF' },
    { level: 11, name: 'Divino', multiplier: 4.5, color: '#CC00FF' },
    { level: 12, name: 'Impossibile', multiplier: 5.5, color: '#9900FF' },
    { level: 13, name: 'Demoniaco', multiplier: 7.0, color: '#6600FF' },
    { level: 14, name: 'Assurdo', multiplier: 9.0, color: '#3300FF' },
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

