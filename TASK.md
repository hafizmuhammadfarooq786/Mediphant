## Intro Note — No Cost Guarantee
This practical test is designed to evaluate your hands‑on skills in a way that’s fair and accessible. You should not need to spend any money to complete it. Everything can be done with free tools and free tiers:
* Next.js / React / TypeScript → all open‑source.
* Local dev tooling → Node.js, npm/yarn/pnpm, Git, VSCode, all free.
* Testing → Jest/Vitest or built‑in Next.js test runners, all free.
* Pinecone → has a free tier that suffices for this exercise.
* Embeddings → optional. If you don’t have an OpenAI/AWS key, you may use the provided fallback (in‑memory cosine similarity/TF‑IDF) instead.
* Swift (Xcode) / Kotlin (Android Studio) → free IDEs; only a small snippet required.
* GitHub → free public or private repos.
* AI coding assistants (Copilot, Cursor, ChatGPT, Claude) are optional; if you don’t have access, that’s fine.
:point_right: In short: the only investment required is your time (2–3 hrs).
---
# Practical Test Instructions
Objective
Build a tiny, end‑to‑end slice that resembles real Mediphant work:
* A Next.js (App Router) feature with an API route.
* A minimal vector‑search retrieval using Pinecone (or a fallback if Pinecone access is an issue).
A tiny native mobile callout in Swift or* Kotlin that hits your API and displays JSON.
Timebox: 2–3 hours total. Don’t overbuild; choose sensible shortcuts. Document any tradeoffs.
What You’ll Deliver (repo layout)
```
mediphant-devtest/
web/ # Next.js 14+ app-router project
retrieval/ # scripts + code for embeddings & Pinecone (or fallback)
mobile/ # EITHER swift/ OR kotlin/ with a minimal screen or function
README.md # setup + decisions + notes
.env.example # show required env keys (no secrets committed)
```
Allowed Tools
* You may use AI coding assistants (Cursor, Copilot, Claude, ChatGPT, etc.).
Please include a short AI‑assist log* in your README: what you asked and which parts of code you accepted/edited (redact any personal info/secrets).
---
## Part A — Next.js Mini‑Feature (≈60–75 min)
Feature: "Medication Interaction Checker (Mock)"
Requirements
1. Page at /interactions with a simple form:
* Inputs: medA, medB (text). Submit button.
* Basic client‑side validation (non‑empty, trim, ignore obvious duplicates like case/spacing).
2. API Route POST /api/interactions that returns a JSON object:
```json
{
"pair": ["<medA>", "<medB>"],
"isPotentiallyRisky": true|false,
"reason": "string",
"advice": "string"
}
```
3. Logic
* Use the tiny ruleset below (mock knowledge) to decide risk. If no rule matches, return isPotentiallyRisky: false with sensible advice.
4. UI
* On submit, call the API and render a clear result card.
* Nice, accessible UX; mobile‑friendly.
5. Quality
* App Router (Next 14+), TypeScript, zod or similar for input parsing.
* Clean file structure and simple tests for the API handler (even 1–2 happy/sad paths).
Mock Ruleset (exact match, case‑insensitive):
("warfarin", "ibuprofen") → risky. Reason:* increased bleeding risk. Advice: avoid combo; consult clinician; prefer acetaminophen for pain relief.
("metformin", "contrast dye") → risky. Reason:* lactic acidosis risk around imaging contrast. Advice: hold metformin per imaging protocol.
("lisinopril", "spironolactone") → risky. Reason:* hyperkalemia risk. Advice: monitor potassium, consult clinician.
Note: This is not clinical advice; it’s a mock. Your code must clearly label results as informational only.
Stretch (optional)
* Capture each query into an in‑memory list with timestamp and render a tiny “Recent checks” list on the page (no DB needed). If you prefer, sketch a DynamoDB single‑table design for this write path in README.
---
## Part B — Retrieval (Pinecone) (≈45–60 min)
Goal: Implement a minimal RAG‑style retrieval endpoint backed by Pinecone.
Dataset (tiny, provided here):
Create a file retrieval/corpus.md with 3–6 short paragraphs (you may paste these):
1. "Medication adherence improves outcomes in diabetes; missed doses are a leading cause of poor control."
2. "Keep an up‑to‑date medication list; reconcile after every clinic or hospital visit."
3. "Use a pill organizer or phone reminders to reduce unintentional nonadherence."
4. "High‑risk interactions include anticoagulants with NSAIDs, ACE inhibitors with potassium‑sparing diuretics, and metformin around contrast imaging."
5. "When in doubt, consult a pharmacist or clinician; online lists can be incomplete."
Requirements
1. Indexing script in retrieval/ that:
* Splits corpus into chunks (your choice, keep it simple).
Embeds with OpenAI or AWS Bedrock (your choice) and upserts* into Pinecone (free tier OK).
* Include .env.example keys like OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX.
2. API Route GET /api/faq?q=<query> that:
* Performs a vector similarity search in Pinecone.
Returns top 2–3 chunks and a concise* synthesized answer (server‑side) along with the raw matches.
* Example response:
```json
{
"answer": "…",
"matches": [{"text":"…","score":0.87}, {"text":"…","score":0.82}]
}
```
Fallback (if Pinecone setup blocks you):
Implement a quick in‑memory cosine similarity* using any JS embedding lib (or a trivial bag‑of‑words TF‑IDF) over the same corpus so the endpoint still works. Note the fallback in README.
Stretch (optional)
* Rerank matches with a cross‑encoder or simple lexical boost for exact term hits.
---
## Part C — Native Call (Swift or Kotlin) (≈20–30 min)
Produce a minimal snippet that calls your /api/faq?q=… and displays the JSON answer in a single view.
SwiftUI (example shape to implement):
* A FaqView with a TextField for query, a Button to fetch, and a Text for the result.
* Use URLSession and Codable for parsing.
Kotlin (Jetpack Compose):
* A composable with a TextField, Button, and a Text showing the result.
* Use OkHttpKtor and kotlinx‑serialization (or Gson) to parse.
You do not need a full app or build.gradle; a single file with the composable/view + the networking function is fine.
---
## Security & Privacy Basics (expected)
* No secrets committed. Use .env and document required keys in .env.example.
Label outputs as informational; not medical advice*.
* Basic input validation and error handling; avoid leaking stack traces.
---
## What to Submit
1. GitHub repo link (public or private + invite).
2. README that includes:
* Setup/run steps for web/ and retrieval/.
* Tooling/versions used (Node, Next.js, package managers).
Your AI‑assist log* (brief bullets are fine).
* Time spent and 2–3 things you’d do next with more time.
3. (Optional) A 2–3 minute Loom or screen recording walking through the feature.
---
## Evaluation Rubric (100 pts)
* Correctness & API Design (25): endpoints behave as specified; clear types; helpful errors.
* Frontend UX & Code Quality (20): clean, accessible UI; thoughtful structure; tests for API.
* Retrieval Quality (20): sensible chunking; correct Pinecone (or solid fallback) with relevant results.
* Cloud/Dev Hygiene (15): env handling, scripts, README clarity; no secrets in repo.
* Native Snippet (10): minimal yet correct call + render.
* Engineering Judgment (10): pragmatic choices, tradeoffs explained, time management.
Bonus (up to +10): small DynamoDB single‑table sketch, reranking, or a basic CI check (lint/test) in GitHub Actions.
---
## Getting Started Tips
* Create Next.js app quickly with create-next-app and App Router.
* Keep the UI minimal but friendly (no CSS frameworks required, but Tailwind is fine if you prefer).
* For Pinecone, a single namespace and 5–10 vectors is plenty.
* If blocked, implement the fallback and note it.
Good luck - we’re excited to see your approach!