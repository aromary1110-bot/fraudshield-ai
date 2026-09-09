import { useState, useRef, useEffect } from 'react'
import VerdictStamp from './VerdictStamp.jsx'
import { checkCurrency } from '../api.js'

export default function CurrencyPane() {
  const [items, setItems] = useState([]); // { type: 'image'|'verdict'|'error', src, verdict, confidence }
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [items, loading]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file || loading) return;

    const previewUrl = URL.createObjectURL(file);
    setItems((prev) => [...prev, { type: 'image', src: previewUrl }]);
    setLoading(true);

    try {
      const result = await checkCurrency(file);
      setItems((prev) => [
        ...prev,
        { type: 'verdict', verdict: result.verdict, confidence: result.confidence },
      ]);
    } catch (err) {
      setItems((prev) => [
        ...prev,
        { type: 'error', text: 'Could not reach the currency-check server. Is currency_app.py running on port 5001?' },
      ]);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

  return (
    <>
      <div className="chat-area" ref={scrollRef}>
        {items.length === 0 && (
          <div className="empty-state">
            <strong>Upload a currency note photo</strong>
            Get an instant real / counterfeit verdict with confidence score
            from the trained model.
          </div>
        )}

        {items.map((item, i) => {
          if (item.type === 'image') {
            return (
              <div className="bubble-row user" key={i}>
                <div className="bubble-image">
                  <img src={item.src} alt="Uploaded note" />
                </div>
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

        {loading && <div className="typing-indicator">scanning note…</div>}
      </div>

      <div className="input-bar">
        <div className="upload-zone">
          <span>📷</span>
          <label htmlFor="note-upload">Choose a note photo to check</label>
          <input
            id="note-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={loading}
          />
        </div>
      </div>
    </>
  );
}
