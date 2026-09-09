// API layer — talks to your two local Flask backends.
// Port 5000 = scam message classifier (app.py)
// Port 5001 = currency real/fake detector (currency_app.py)

const SCAM_API_BASE = "https://fraudshield-ai-7wj9.onrender.com";
const CURRENCY_API_BASE = "https://fraudshield-ai-1-tyot.onrender.com";

/**
 * Confirmed from your test in VS Code:
 *   curl -X POST http://127.0.0.1:5001/api/check-currency -F "image=@test_note.jpg"
 *   -> { confidence, raw_model_output, verdict }
 */
export async function checkCurrency(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${CURRENCY_API_BASE}/api/check-currency`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Currency API error: ${res.status}`);
  return res.json(); // { confidence, raw_model_output, verdict }
}

/**
 * NOTE: I haven't seen your app.py route for the scam classifier, so this
 * assumes a POST to /api/check-message with a JSON body { message: text }.
 * Open backend/app.py and check the @app.route(...) line — if the path or
 * field name differs, just update the two lines below to match.
 */
export async function checkMessage(text) {
  const res = await fetch(`${SCAM_API_BASE}/api/analyze-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  if (!res.ok) throw new Error(`Scam API error: ${res.status}`);
  return res.json();
} // expected shape: { verdict, confidence, ... }

