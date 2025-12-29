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
  TOTAL_QUESTIONS: 10,
  DIFFICULTY_LEVELS: ['facile', 'medio', 'difficile', 'molto difficile', 'esperto'],
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
  DIFFICULTY_MULTIPLIER: {
    'facile': 1,
    'medio': 1.5,
    'difficile': 2,
    'molto difficile': 2.5,
    'esperto': 3,
  },
}

