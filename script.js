/**
 * =============================================
 * QUIZ CONTENT — edit with real customer/venue data
 * =============================================
 * clues[0]           -> shown immediately
 * clues[1]           -> auto-revealed after 3 wrong guesses
 * acceptableAnswers   -> lowercase strings/aliases counted as correct
 * venueQuery          -> plain-text address/search term used for both
 *                        the "Get Directions" link and the embedded map
 */
const quizData = [
  {
    clues: [
      "This customer is a major UK insurance firm founded in 2012 and their London office is just on the other side of London Bridge.",
      "Hint: They were recently acquired by another major UK insurer for £3.7bn."
    ],
    acceptableAnswers: ["Direct Line", "direct line", "Direct line", "DLIS", "dlis", "dl", "DL"],
    customerName: "Direct Line Insurance",
    venueName: "The Wine Shades",
    venueQuery: "The Wine Shades, London, UK"
  },
{
    clues: [
      "This customer is a UK financial services firm - their logo is a multi-coloured umberella",
      "Hint: They have a two word name ____ & _______"
    ],
    acceptableAnswers: ["Legal & General", "L&G", "Legal and General", "L and G", "LandG", "l&g", "l and g", "legal & general", "legal and general"],
    customerName: "Legal and General",
    venueName: "The Globe Pub",
    venueQuery: "The Globe Pub, Moorgate, London, UK"
  },
  {
    clues: [
      "This customer was one of NWT's first and they license public places to play music - making sure performers get paid",
      "Hint: Their name is a three letter acronym."
    ],
    acceptableAnswers: ["PPL", "ppl", "PPL (Phonographic Performance Limited)", "Phonographic Performance Limited"],
    customerName: "PPL (Phonographic Performance Limited)",
    venueName: "Simmons Bar",
    venueQuery: "Simmons Bar, Picadilly Circus, London, UK"
  },
  
{
    clues: [
      "This customer is one of the largest government departments, handling approximately £1.1 TRILLION per year - more than any commercial bank in the world.",
      "Hint: They specialise in collecting tax, and distributing benefits"
    ],
    acceptableAnswers: ["HMRC", "HM Revenue and Customs", "hmrc"],
    customerName: "HM Revenue and Customs (HMRC)",
    venueName: "The Red Lion",
    venueQuery: "The Red Lion, Parliament Street, London, UK"
  }
];

const WRONG_GUESSES_BEFORE_HINT = 3;

// --- Application state ---
const state = {
  currentIndex: 0,
  wrongAttempts: 0,
  hintRevealed: false,
  score: 0
};

// --- DOM references ---
const clueTextEl = document.getElementById("clue-text");
const hintTextEl = document.getElementById("hint-text");
const answerForm = document.getElementById("answer-form");
const answerInput = document.getElementById("answer-input");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const questionView = document.getElementById("question-view");
const revealView = document.getElementById("reveal-view");
const summaryView = document.getElementById("summary-view");

const customerNameEl = document.getElementById("customer-name");
const venueInfoEl = document.getElementById("venue-info");
const directionsLink = document.getElementById("directions-link");
const venueMapEl = document.getElementById("venue-map");
const scoreTextEl = document.getElementById("score-text");

const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");

/**
 * Renders the current question's clue and resets
 * attempt/hint state for a fresh question.
 */
function renderQuestion() {
  const question = quizData[state.currentIndex];

  clueTextEl.textContent = question.clues[0];
  hintTextEl.textContent = "";
  hintTextEl.classList.add("hidden");
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  answerInput.value = "";

  state.wrongAttempts = 0;
  state.hintRevealed = false;

  // Clear the previous question's embedded map so it isn't loaded unnecessarily
  venueMapEl.src = "";

  updateProgress();

  questionView.classList.remove("hidden");
  revealView.classList.add("hidden");
  summaryView.classList.add("hidden");

  answerInput.focus();
}

/** Updates the progress bar and label above the quiz. */
function updateProgress() {
  const total = quizData.length;
  const current = state.currentIndex + 1;
  progressBar.style.width = `${((current - 1) / total) * 100}%`;
  progressLabel.textContent = `Question ${current} of ${total}`;
}

/**
 * Reveals the hint automatically once the wrong-guess
 * threshold has been reached (only fires once per question).
 */
function maybeRevealHint() {
  const question = quizData[state.currentIndex];
  const hasHint = question.clues.length > 1;

  if (
    hasHint &&
    !state.hintRevealed &&
    state.wrongAttempts >= WRONG_GUESSES_BEFORE_HINT
  ) {
    hintTextEl.textContent = question.clues[1];
    hintTextEl.classList.remove("hidden");
    state.hintRevealed = true;
  }
}

/**
 * Compares the user's guess (normalised) against the
 * list of acceptable answers for the current question.
 */
function checkAnswer(event) {
  event.preventDefault();

  const question = quizData[state.currentIndex];
  const userGuess = answerInput.value.trim().toLowerCase();

  const isCorrect = question.acceptableAnswers.some(
    (answer) => answer.toLowerCase() === userGuess
  );

  if (isCorrect) {
    state.score += 1;
    feedbackEl.textContent = "Correct!";
    feedbackEl.className = "feedback correct";
    revealAnswer(question);
    return;
  }

  state.wrongAttempts += 1;
  maybeRevealHint();

  const remaining = Math.max(
    0,
    WRONG_GUESSES_BEFORE_HINT - state.wrongAttempts
  );

  if (state.hintRevealed) {
    feedbackEl.textContent = "Not quite — take a look at the hint above.";
    feedbackEl.className = "feedback incorrect";
  } else {
    feedbackEl.textContent = `Not quite. ${remaining} more guess${
      remaining === 1 ? "" : "es"
    } until a hint appears.`;
    feedbackEl.className = "feedback muted";
  }

  answerInput.value = "";
  answerInput.focus();
}

/** Shows the customer name, venue details, embedded map, and directions link. */
function revealAnswer(question) {
  customerNameEl.textContent = "Correct! " + question.customerName;
  venueInfoEl.textContent = `Head over to "${question.venueName}" nearby to celebrate!`;

  // "Get Directions" link — opens Google Maps in a new tab
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    question.venueQuery
  )}`;
  directionsLink.href = mapsUrl;

  // Embedded mini map — uses Google's key-free embed endpoint, same address
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    question.venueQuery
  )}&output=embed`;
  venueMapEl.src = mapEmbedUrl;

  progressBar.style.width = `${
    ((state.currentIndex + 1) / quizData.length) * 100
  }%`;

  questionView.classList.add("hidden");
  revealView.classList.remove("hidden");

  nextBtn.textContent =
    state.currentIndex === quizData.length - 1
      ? "See Results →"
      : "Next Question →";
}

/** Advances to the next question, or shows the summary if finished. */
function nextQuestion() {
  if (state.currentIndex < quizData.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    showSummary();
  }
}

/** Displays the final score and offers a restart option. */
function showSummary() {
  questionView.classList.add("hidden");
  revealView.classList.add("hidden");
  summaryView.classList.remove("hidden");

  scoreTextEl.textContent = `You correctly identified ${state.score} of ${quizData.length} customers.`;
}

/** Resets state and starts the quiz over from the first question. */
function restartQuiz() {
  state.currentIndex = 0;
  state.score = 0;
  renderQuestion();
}

// --- Event wiring ---
answerForm.addEventListener("submit", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

// --- Initial render ---
renderQuestion();
