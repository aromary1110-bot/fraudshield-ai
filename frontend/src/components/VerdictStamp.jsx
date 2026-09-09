// Normalizes whatever verdict string your backend returns into a
// display category. Add synonyms here if your model outputs different words.
function classify(verdictRaw) {
  const v = (verdictRaw || '').toLowerCase();

  if (['real', 'genuine', 'safe', 'legit', 'not scam'].some((w) => v.includes(w))) {
    return { cls: 'real', label: 'Verified', icon: '✓' };
  }
  if (['fake', 'counterfeit'].some((w) => v.includes(w))) {
    return { cls: 'fake', label: 'Counterfeit', icon: '✕' };
  }
  if (['scam', 'fraud', 'phishing'].some((w) => v.includes(w))) {
    return { cls: 'scam', label: 'Scam Detected', icon: '!' };
  }
  return { cls: 'caution', label: 'Review Needed', icon: '?' };
}

export default function VerdictStamp({ verdict, confidence }) {
  const { cls, label, icon } = classify(verdict);
  const pct = typeof confidence === 'number' ? confidence.toFixed(1) : confidence;

  return (
    <div className={`bubble-row system`}>
      <div className={`verdict-card ${cls}`}>
        <div className="verdict-icon">{icon}</div>
        <div>
          <div className="verdict-label">{label}</div>
          {pct !== undefined && (
            <div className="verdict-confidence">confidence: {pct}%</div>
          )}
        </div>
      </div>
    </div>
  );
}
