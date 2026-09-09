export default function Header() {
  return (
    <header className="header">
      <div className="header-seal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L4 5v6c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5l-8-3z"
            stroke="#F0A202"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 12.2l2.3 2.3 4.7-4.9"
            stroke="#F0A202"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="header-titles">
        <h1>FraudShield AI</h1>
        <p>Digital Public Safety · Fraud Intelligence</p>
      </div>
    </header>
  )
}
