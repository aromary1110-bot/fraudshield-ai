# FraudShield AI — Frontend Setup

## 1. Copy files into your project
Copy everything in this folder into your existing `frontend/` directory
(the one you already have open in VS Code), replacing its contents.

## 2. Install and run
```bash
cd frontend
npm install
npm run dev
```
Opens at `http://localhost:5173`.

## 3. Fix CORS on both Flask backends (do this first — the #1 thing that will break)
Your browser will block requests from `localhost:5173` to `localhost:5000` /
`localhost:5001` unless the Flask apps allow it. In **both** `app.py` and
`currency_app.py`, add:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)   # add this line right after creating the app
```

Install it if you don't have it:
```bash
pip install flask-cors
```

## 4. Verify the message-check endpoint name
I built `src/api.js` assuming your scam classifier exposes:
```
POST http://127.0.0.1:5000/api/check-message
Body: { "message": "..." }
```
I copied the currency endpoint exactly from your working curl test, but I
haven't seen `app.py`'s route for messages — open it and check the
`@app.route(...)` line. If the path or JSON field name is different, update
the two matching lines in `src/api.js` (function `checkMessage`).

Also check what field names the response JSON uses — the UI reads
`result.verdict` and `result.confidence`. If your scam model returns
different keys (e.g. `label`, `probability`), adjust `ChatPane.jsx` where it
calls `setItems(...)` after `checkMessage`.

## 5. Run everything together for the demo
Three terminals:
```bash
# Terminal 1
cd backend && python app.py            # port 5000

# Terminal 2
cd backend && python currency_app.py   # port 5001

# Terminal 3
cd frontend && npm run dev             # port 5173
```

## What's built
- **Message Check tab** — paste a scam message, get a stamped verdict card
  (Scam Detected / Verified / Review Needed) with confidence %.
- **Currency Check tab** — upload a note photo, same verdict-card treatment
  (Counterfeit / Verified).
- Chat-style layout, navy/amber/verified-green palette matching your
  original design plan, mobile-responsive, no build-step surprises.

## If you want to go further before the deadline
- Add a "Report to NCRB" button on scam verdicts (even a static link to
  cybercrime.gov.in is a good judge-facing touch given your challenge brief).
- Add a confidence bar/gauge instead of just text — quick visual win.
- Swap the emoji tab icons for small inline SVGs if you want a more
  polished look for the final demo.
