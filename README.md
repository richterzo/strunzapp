# 🎮 STRUNZAPP

Cyberpunk party game collection - Local multiplayer games for your next party!

## 🕹️ Games

### 1. STRONZO
Find the impostor! A social deduction game where players try to identify who doesn't know the secret word.

**Features:**
- 3-10 players (local)
- 3 categories with 100 words each
- Hide/show mechanism for privacy
- Cyberpunk aesthetic

### 2. DRAGON QUIZ 🐉
AI-powered quiz game with increasing difficulty powered by ChatGPT.

**Features:**
- Single player or team mode
- 10 questions per game
- Progressive difficulty (easy → expert)
- Multiple categories
- Real-time scoring
- AI-generated questions

## 🚀 Setup

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key (for Dragon Quiz)

### Installation

```bash
# Clone repository
git clone https://github.com/richterzo/strunzapp.git
cd strunzapp

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
# VITE_OPENAI_API_KEY=your_key_here
```

### Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add it to your `.env` file

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## 🎨 Design

Modern cyberpunk aesthetic with:
- Neon cyan (#00FFF0) and pink (#FF006E) accents
- Orbitron and Rajdhani fonts
- Scanline effects
- Smooth animations
- Fully responsive

## 🏗️ Architecture

### Current Structure
```
src/
├── config/
│   └── api.js              # API configuration
├── services/
│   └── openaiService.js    # OpenAI integration
├── screens/
│   ├── HomeScreen.jsx      # Main menu
│   ├── StronzoSetupScreen.jsx
│   ├── StronzoGameScreen.jsx
│   ├── DragonQuizSetupScreen.jsx
│   └── DragonQuizGameScreen.jsx
└── App.jsx                 # Router configuration
```

### Multiplayer Ready
The codebase is structured to support future online multiplayer:
- Game modes: `single`, `local`, `online` (future)
- Modular game logic
- State management ready for WebSocket integration

## 🔮 Future Features

- [ ] Online multiplayer with WebSocket
- [ ] More mini-games
- [ ] Player profiles and stats
- [ ] Leaderboards
- [ ] Custom quiz categories
- [ ] Voice chat integration

## 📱 Responsive Design

Optimized for:
- Desktop (1920x1080+)
- Tablet (768px+)
- Mobile (375px+)

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Styling**: CSS3 with custom properties
- **AI**: OpenAI GPT-4o-mini
- **Fonts**: Google Fonts (Orbitron, Rajdhani)

## 📄 License

MIT License - feel free to use for your parties!

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

## 🎉 Credits

Created with ❤️ for epic party nights

---

**Note**: Dragon Quiz requires an OpenAI API key. Usage costs apply based on OpenAI's pricing.
