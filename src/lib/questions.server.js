// Server-only accessor for questions bundled with the app.
// Using a static import avoids runtime fs access and keeps data out of client bundles.

import questions from '../data/questions.json' assert { type: 'json' }

export function loadQuestions() {
  if (!Array.isArray(questions)) {
    throw new Error('questions.json must export an array')
  }
  return questions
}


