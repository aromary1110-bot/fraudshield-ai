export default function ModeSwitch({ mode, setMode }) {
  return (
    <div className="mode-switch">
      <button
        className={`mode-btn ${mode === 'message' ? 'active' : ''}`}
        onClick={() => setMode('message')}
      >
        💬 Message Check
      </button>
      <button
        className={`mode-btn ${mode === 'currency' ? 'active' : ''}`}
        onClick={() => setMode('currency')}
      >
        💵 Currency Check
      </button>
    </div>
  )
}
