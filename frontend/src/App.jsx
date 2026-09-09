import { useState } from 'react'
import Header from './components/Header.jsx'
import ModeSwitch from './components/ModeSwitch.jsx'
import ChatPane from './components/ChatPane.jsx'
import CurrencyPane from './components/CurrencyPane.jsx'

export default function App() {
  const [mode, setMode] = useState('message');

  return (
    <div className="app-shell">
      <Header />
      <ModeSwitch mode={mode} setMode={setMode} />
      {mode === 'message' ? <ChatPane /> : <CurrencyPane />}
    </div>
  );
}
