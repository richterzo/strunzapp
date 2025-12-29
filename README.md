# StrunzApp 🎮

App web con minigiochi per telefono. Il primo minigioco è **STRONZO**, un gioco stile "impostore" dove i giocatori devono trovare chi non conosce la parola segreta.

## ✨ Caratteristiche

- 🎮 Minigioco STRONZO completamente funzionante
- 🎨 Design moderno stile underground/graffiti
- 📱 Ottimizzato per dispositivi mobili (responsive)
- ⚡ Interfaccia snappy e veloce
- 🔄 Facilmente espandibile con nuovi minigiochi
- 🎯 Animazioni fluide e feedback visivo
- 📳 Supporto vibrazione (se disponibile)
- 🎲 Sistema intelligente per evitare parole ripetute

## 🚀 Installazione

```bash
npm install
```

## ▶️ Avvio

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## 📦 Build per produzione

```bash
npm run build
```

Il build sarà disponibile nella cartella `dist/`

## 🎯 Come giocare a STRONZO

1. **Setup**: Seleziona il numero di giocatori (3-12)
2. **Nomi**: Inserisci i nomi dei giocatori
3. **Categorie**: Scegli le categorie di parole (Cibi, Oggetti, Paesi del Mondo)
4. **Gioco**: A turno, ogni giocatore vede la parola segreta
   - Gli "stronzi" (impostori) NON vedono la parola
   - Devono fingere di conoscerla!
5. **Discussione**: I giocatori discutono e cercano di capire chi è lo stronzo
6. **Rivelazione**: Alla fine del turno si rivela chi era lo stronzo!
7. **Prossimo turno**: Puoi continuare con nuove parole

## 🎨 Design

- Stile underground/graffiti con colori scuri e accenti rossi
- Font "Bungee" per un look bold e moderno
- Animazioni fluide e transizioni smooth
- Ottimizzato per touch screen mobile

## 🔧 Tecnologie

- React 18
- Vite (build tool veloce)
- React Router (navigazione)
- CSS puro (nessuna dipendenza UI pesante)

## 📝 Note

L'app è progettata per essere facilmente espandibile. Puoi aggiungere nuovi minigiochi seguendo la stessa struttura:
- Crea un nuovo componente nella cartella `screens/`
- Aggiungi la route in `App.jsx`
- Aggiungi il gioco alla lista nella `HomeScreen`

