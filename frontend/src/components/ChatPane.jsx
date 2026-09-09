import { useState, useRef, useEffect } from 'react'
import VerdictStamp from './VerdictStamp.jsx'
import { checkMessage } from '../api.js'

export default function ChatPane() {
  const [items, setItems] = useState([]); // { type: 'user'|'verdict'|'error', text, verdict, confidence }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [items, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setItems((prev) => [...prev, { type: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const result = await checkMessage(text);
      setItems((prev) => [
        ...prev,
        { type: 'verdict', verdict: result.verdict, confidence: result.confidence },
      ]);
    } catch (err) {
      setItems((prev) => [
        ...prev,
        { type: 'error', text: 'Could not reach the scam-check server. Is app.py running on port 5000?' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="chat-area" ref={scrollRef}>
        {items.length === 0 && (
          <div className="empty-state">
            <strong>Paste a suspicious message</strong>
            Forwarded payment requests, "digital arrest" calls, OTP scams —
            paste the text and get an instant verdict.
          </div>
        )}

        {items.map((item, i) => {
          if (item.type === 'user') {
            return (
              <div className="bubble-row user" key={i}>
                <div className="bubble user">{item.text}</div>
              </div>
            );
          }
          if (item.type === 'verdict') {
            return <VerdictStamp key={i} verdict={item.verdict} confidence={item.confidence} />;
          }
          return (
            <div className="bubble-row system" key={i}>
              <div className="bubble system">{item.text}</div>
            </div>
          );
        })}

        {loading && <div className="typing-indicator">analyzing message…</div>}
      </div>

      <div className="input-bar">
        <textarea
          className="text-input"
          rows={1}
          placeholder="Paste the message here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
          ➤
        </button>
      </div>
    </>
  );
}
