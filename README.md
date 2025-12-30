# 🎮 STRUNZAPP

**Modern party game collection** - Underground street-style local multiplayer games for epic nights!

## 🕹️ Games

### 1. 🎭 STRONZO (Impostore)
Social deduction game - Find the impostor among your friends!

**Features:**
- 3-10 players (local)
- 3 categories with 100+ words each
- Hide/show mechanism for privacy
- AI-powered word generation
- Underground graffiti aesthetic

### 2. 💭 STRUNZATE
Deep conversation starter with AI-generated questions.

**Features:**
- Unlimited questions
- 4 categories: Personali, Filosofiche, Piccanti, Scomode
- AI generates unique, thought-provoking questions
- Perfect for breaking the ice
- Memory system prevents repetition

### 3. 🎯 MERDA VINCENTE
Italian-style word guessing game - Make your partner guess words!

**Features:**
- Teams of 2 players
- Timed rounds (30-120 seconds)
- Pass system (3 or unlimited)
- AI-generated words
- Record mode for high scores
- TV show style gameplay

### 4. 🐉 DRAGON QUIZ
AI-powered quiz with progressive difficulty from easy to legendary.

**Features:**
- Single player or team mode
- 10 difficulty levels (Base → Dragone)
- Progressive difficulty (like "Chi vuol essere milionario")
- 5 multiple choice options
- Categories: Storia, Geografia, Scienze, Arte, Cinema, Musica, Sport, Cultura Generale
- Combo system (x2, x3, x4, x5) for consecutive correct answers
- Timer mode (optional)
- Memory system prevents question repetition
- Real-time scoring with multipliers

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** and npm
- **OpenAI API key** (for AI-powered games: Dragon Quiz, Strunzate, word generation)

### Installation

```bash
# Clone repository
git clone https://github.com/richterzo/strunzapp.git
cd strunzapp

# Install dependencies
npm install

# Create .env file
echo "VITE_OPENAI_API_KEY=your_key_here" > .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add it to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Design

**Underground street aesthetic** with:
- **Brand colors**: Orange (#FF6B00) and Black (#000000)
- **Fonts**: Orbitron, Rajdhani (sci-fi/arcade style)
- Animated backgrounds with gradients
- Arcade-style hover/click effects
- Videogame micro-animations
- Fully responsive mobile-first design

## 🏗️ Architecture

### File Structure
```
strunzapp/
├── src/
│   ├── config/
│   │   └── api.js                    # API configuration
│   ├── services/
│   │   └── openaiService.js          # OpenAI integration
│   ├── utils/
│   │   ├── quizMemory.js             # Dragon Quiz memory
│   │   ├── wordsMemory.js            # Stronzo/Merda memory
│   │   └── strunzateMemory.js        # Strunzate memory
│   ├── screens/
│   │   ├── HomeScreen.jsx            # Main menu
│   │   ├── StronzoSetupScreen.jsx    # Stronzo setup
│   │   ├── StronzoGameScreen.jsx     # Stronzo game
│   │   ├── StrunzateSetupScreen.jsx  # Strunzate setup
│   │   ├── StrunzateGameScreen.jsx   # Strunzate game
│   │   ├── IntesaVincenteSetupScreen.jsx  # Merda setup
│   │   ├── IntesaVincenteGameScreen.jsx   # Merda game
│   │   ├── DragonQuizSetupScreen.jsx # Quiz setup
│   │   ├── DragonQuizGameScreen.jsx  # Quiz game
│   │   └── shared-setup.css          # Shared setup styles
│   ├── data/
│   │   └── intesaWords.js            # Fallback words
│   └── App.jsx                       # Router
├── public/
│   └── images/                       # Game assets
└── vite.config.js                    # Build config
```

### Key Features

#### 🧠 Memory System
All AI-powered games use `localStorage` to track:
- **Dragon Quiz**: Used questions + category distribution
- **Strunzate**: Last 100 questions asked
- **Words**: Used words for Stronzo and Merda Vincente

This ensures:
✅ No question/word repetition
✅ Persistent across sessions
✅ Intelligent category rotation
✅ Better user experience

#### 🤖 AI Integration
- **Model**: GPT-4o-mini (fast + cost-effective)
- **Prompt Engineering**: Few-shot learning with concrete examples
- **JSON Mode**: `response_format: { type: "json_object" }` for reliable parsing
- **Retry Logic**: 3 attempts for unique generation
- **Fallback**: Static word lists if AI unavailable

#### 📱 Mobile-First Design
- Touch-optimized buttons (min 44px)
- Smooth iOS scrolling (`-webkit-overflow-scrolling: touch`)
- Safe area insets for notched devices
- Responsive breakpoints: Mobile (375px) → Tablet (768px) → Desktop (1024px+)
- No pull-to-refresh interference

### Multiplayer Ready
The codebase is structured for future online multiplayer:
- Game modes: `single`, `local`, `online` (future)
- Modular game logic
- State management ready for WebSocket integration

## 🔮 Future Features

- [ ] Online multiplayer with WebSocket
- [ ] Player profiles and stats
- [ ] Leaderboards
- [ ] Custom quiz categories
- [ ] Voice chat integration
- [ ] More mini-games
- [ ] PWA support (offline mode)

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **Styling**: CSS3 with custom properties
- **AI**: OpenAI GPT-4o-mini
- **Fonts**: Google Fonts (Orbitron, Rajdhani)
- **Storage**: localStorage for persistence
- **Build**: Vite (ESM, HMR, optimized builds)

## 📱 Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## 📊 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: ~150KB (gzipped)
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI-powered features
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

## 🐛 Troubleshooting

### API Key Issues
- Ensure `.env` file is in the root directory
- Restart dev server after adding API key
- Check API key is valid on OpenAI platform

### Mobile Scrolling Issues
- Clear browser cache
- Ensure no `overflow: hidden` on body
- Check safe area insets on notched devices

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📄 License

MIT License - feel free to use for your parties!

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

### Development Guidelines
1. Use ESLint and Prettier
2. Follow existing component structure
3. Add comments for complex logic
4. Test on mobile devices
5. Optimize images (use PNG with transparency)

## 🎉 Credits

Created with ❤️ for epic party nights

Special thanks to:
- OpenAI for GPT-4o-mini API
- React team for amazing framework
- Vite team for blazing fast tooling

---

**⚠️ Note**: Dragon Quiz, Strunzate, and word generation require an OpenAI API key. Usage costs apply based on OpenAI's pricing (~$0.0001-0.0005 per question).

**🎮 Perfect for**: House parties, road trips, team building, icebreakers, game nights!

**🌟 Star us on GitHub** if you have fun with StrunzApp!
