# REVERT CHANGELOG - Modifiche da riapplicare

## ✅ STATO ATTUALE
**App funzionante dopo revert di 7 commit!**

## 🔍 PROSSIMI PASSI
Riapplicare i commit uno alla volta per trovare quello problematico.

## Commits da testare (dal più recente al più vecchio)

### 1. 3d4dfd9 - 🔧 FIX Dev Server - React 19 Config
**Data**: Oggi  
**Modifiche**:
- `vite.config.js`: Aggiunto `jsxRuntime: 'automatic'` al plugin React
- Configurazione esplicita per React 19

**File modificati**:
- `vite.config.js`

**Revert**: `git revert 3d4dfd9`

---

### 2. ab6a2ad - 🔧 FIX Dev Server - Cache Headers + Cleanup!
**Data**: Oggi  
**Modifiche**:
- `vite.config.js`: Aggiunti header no-cache al dev server
  - Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
  - Pragma: no-cache
  - Expires: 0

**File modificati**:
- `vite.config.js`

**Revert**: `git revert ab6a2ad`

---

### 3. e957ce2 - 🐛 FIX Build - Errore Minificazione + Meta Tag!
**Data**: Oggi  
**Modifiche**:
- `vite.config.js`: Cambiato minify da 'terser' a 'esbuild'
- `index.html`: Aggiunta meta tag `mobile-web-app-capable`
- Rimossi `terserOptions` (non più necessari con esbuild)

**File modificati**:
- `vite.config.js`
- `index.html`

**Revert**: `git revert e957ce2`

---

### 4. 8633a0f - 🎲 FIX Dragon Quiz - Varietà Domande!
**Data**: Oggi  
**Modifiche**:
- `dragonQuizService.js`: 
  - Rimossi esempi specifici dal prompt (Colombo, Azoto)
  - Aggiunti avvisi anti-copia
  - Temperature aumentata da 0.7 a 0.95
  - Aggiunto random seed per varietà

**File modificati**:
- `src/services/dragonQuizService.js`

**Revert**: `git revert 8633a0f`

---

### 5. 83d8803 - 🐛 FIX Dragon Quiz - Bug Secondo Round!
**Data**: Oggi  
**Modifiche**:
- `DragonQuizGameScreen.jsx`: 
  - Fix condizione useEffect per caricamento round
  - Aggiunto `setGamePhase('loading')` prima di incrementare round
  - Migliorato logging

**File modificati**:
- `src/screens/DragonQuizGameScreen.jsx`

**Revert**: `git revert 83d8803`

---

### 6. 61065a9 - 🎤 Stronzo - Indica Chi Inizia!
**Data**: Oggi  
**Modifiche**:
- `StronzoGameScreen.jsx`: Aggiunto stato `startingPlayer`
- `StronzoGameScreen.css`: Stili per annuncio giocatore che inizia
- Selezione casuale giocatore all'inizio discussione

**File modificati**:
- `src/screens/StronzoGameScreen.jsx`
- `src/screens/StronzoGameScreen.css`

**Revert**: `git revert 61065a9`

---

### 7. 13b3638 - 🏗️ REFACTOR Services - Architettura Modulare!
**Data**: Oggi  
**Modifiche**:
- Creati nuovi file:
  - `src/services/baseService.js`
  - `src/services/dragonQuizService.js`
  - `src/services/partyGamesService.js`
  - `src/services/strunzateService.js`
  - `src/services/index.js`
- Rimosso: `src/services/openaiService.js`
- Aggiornati tutti gli import nei file screen

**File modificati**:
- `src/services/*` (refactor completo)
- `src/screens/*.jsx` (import aggiornati)

**Revert**: `git revert 13b3638`

---

### 8. 740a416 - 🔥 FIX Strunzate Piccanti - Varietà Domande!
**Data**: Ieri  
**Modifiche**:
- `openaiService.js`: Migliorato prompt per domande piccanti
- Aggiunti 12 esempi vari
- Sezione "VARIETÀ OBBLIGATORIA"

**File modificati**:
- `src/services/openaiService.js` (ora in strunzateService.js)

**Revert**: `git revert 740a416`

---

### 9. 4746a73 - 🎛️ IMPOSTAZIONI COLLASSABILI + REACT 19!
**Data**: Ieri  
**Modifiche**:
- Setup screens: Impostazioni collassabili
- `package.json`: React 19, React Router 7, Vite 6

**File modificati**:
- `package.json`
- `src/screens/*SetupScreen.jsx`

**Revert**: `git revert 4746a73`

---

### 10. 5065be1 - ⬆️ MAJOR UPDATE - React 19, Vite 6, React Router 7!
**Data**: Ieri  
**Modifiche**:
- `package.json`: 
  - react: 18.3.1 → 19.0.0
  - react-dom: 18.3.1 → 19.0.0
  - react-router-dom: 6.30.2 → 7.1.1
  - vite: 5.4.21 → 6.0.7

**File modificati**:
- `package.json`

**Revert**: `git revert 5065be1`

---

## Piano di Revert

1. **Testare commit corrente** (3d4dfd9) - Se non funziona, revert
2. **Revert 3d4dfd9** → Test
3. **Revert ab6a2ad** → Test
4. **Revert e957ce2** → Test (questo è il cambio minify!)
5. Continuare fino a trovare il commit che rompe

## Note

- Il commit **e957ce2** (cambio minify) è sospetto - potrebbe essere la causa
- Il commit **5065be1** (React 19) potrebbe avere problemi di compatibilità
- Il commit **13b3638** (refactor services) è grande ma dovrebbe essere OK

