import { useCallback, useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const GAME_DURATION = 30;
const BEST_KEY = 'chaos-arena-chaos-colors-best';

const COLORS = [
  { name: 'RED', value: '#ff647c' },
  { name: 'BLUE', value: '#7196ff' },
  { name: 'GREEN', value: '#5ce0a5' },
  { name: 'YELLOW', value: '#f4d76c' },
  { name: 'PURPLE', value: '#b49aff' },
  { name: 'PINK', value: '#ff88cb' },
];

const styles = `
  .colors-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .colors-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .colors-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }

  .colors-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .colors-heading {
    margin: 32px 0 23px;
  }

  .colors-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .colors-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .colors-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .colors-heading p {
    max-width: 610px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .colors-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 17px;
  }

  .colors-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .colors-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .colors-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .colors-panel {
    padding: clamp(18px, 4vw, 34px);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 19px;
    background:
      radial-gradient(ellipse at top, rgba(139,92,246,.12), transparent 60%),
      rgba(20,16,34,.72);
    box-shadow:
      0 25px 70px rgba(0,0,0,.25),
      inset 0 1px 0 rgba(255,255,255,.05);
  }

  .colors-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
  }

  .colors-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .colors-status {
    color: #a9a1bf;
    font: 9px 'Space Mono', monospace;
  }

  .colors-question {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 24px 14px;
    border: 1px solid rgba(193,165,255,.14);
    border-radius: 15px;
    background:
      radial-gradient(ellipse at center, rgba(167,139,250,.09), transparent 72%),
      rgba(255,255,255,.02);
    text-align: center;
  }

  .colors-question-label {
    color: #a69bbd;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .colors-word {
    min-height: 95px;
    display: grid;
    place-items: center;
    max-width: 100%;
    overflow-wrap: anywhere;
    font: 900 clamp(47px, 11vw, 84px)/1 'Barlow Condensed', sans-serif;
    letter-spacing: 3px;
    user-select: none;
    text-shadow: 0 0 24px rgba(255,255,255,.045);
  }

  .colors-instruction {
    max-width: 400px;
    color: #b8afcc;
    font-size: 12px;
    line-height: 1.8;
  }

  .colors-instruction strong {
    color: #dfd0ff;
  }

  .colors-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 11px;
    margin-top: 22px;
  }

  .colors-option {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 8px;
    color: #eee8ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.17);
    border-radius: 12px;
    font: 700 11px 'Space Mono', monospace;
    letter-spacing: .3px;
    cursor: pointer;
    transition:
      transform .16s,
      border-color .16s,
      background .16s,
      box-shadow .16s;
  }

  .colors-option:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(193,165,255,.48);
    background: rgba(167,139,250,.09);
  }

  .colors-option:active:not(:disabled) {
    transform: scale(.97);
  }

  .colors-option:focus-visible,
  .colors-action:focus-visible {
    outline: 2px solid #d0bbff;
    outline-offset: 3px;
  }

  .colors-option:disabled {
    cursor: default;
    opacity: .7;
  }

  .colors-swatch {
    width: 15px;
    height: 15px;
    flex: 0 0 15px;
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 50%;
    box-shadow: 0 0 12px color-mix(in srgb, var(--swatch-color) 28%, transparent);
  }

  .colors-feedback {
    min-height: 55px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 14px;
    text-align: center;
  }

  .colors-feedback-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .colors-feedback-title.correct {
    color: #7af2bd;
  }

  .colors-feedback-title.incorrect {
    color: #ff91a4;
  }

  .colors-feedback-copy {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .colors-action {
    width: 100%;
    margin-top: 15px;
    padding: 15px 18px;
    border: 1px solid rgba(225,210,255,.65);
    border-radius: 10px;
    color: #160d27;
    background: linear-gradient(110deg, #d0bbff, #9873f0);
    font: 700 11px 'Space Mono', monospace;
    letter-spacing: .8px;
    cursor: pointer;
    box-shadow: 0 8px 26px rgba(139,92,246,.2);
    transition: transform .2s, filter .2s;
  }

  .colors-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .colors-action:active {
    transform: scale(.99);
  }

  .colors-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .colors-page { padding: 18px 12px; }
    .colors-heading { margin-top: 26px; }
    .colors-stats { gap: 7px; }
    .colors-stat { padding: 11px; }
    .colors-stat-label { font-size: 8px; letter-spacing: .2px; }
    .colors-question { min-height: 225px; }
    .colors-options { gap: 7px; }
    .colors-option {
      flex-direction: column;
      min-height: 70px;
      gap: 7px;
      font-size: 9px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .colors-option,
    .colors-action { transition: none; }
  }
`;

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function shuffledOptions(targetName) {
  const otherColors = COLORS.filter((color) => color.name !== targetName);
  const shuffled = [...otherColors].sort(() => Math.random() - 0.5);

  const choices = [
    COLORS.find((color) => color.name === targetName),
    ...shuffled.slice(0, 3),
  ];

  return choices.sort(() => Math.random() - 0.5);
}

function createQuestion(previousInkName = null) {
  const inkChoices = COLORS.filter(
    (color) => color.name !== previousInkName
  );
  const ink = inkChoices[Math.floor(Math.random() * inkChoices.length)];
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    word: word.name,
    ink,
    options: shuffledOptions(ink.name),
  };
}

function ChaosColors({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [question, setQuestion] = useState(() => createQuestion());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('Ready to test your focus?');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [feedbackCopy, setFeedbackCopy] = useState(
    'Ignore the word. Identify the colour of the ink.'
  );
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const phaseRef = useRef('ready');
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const timeRef = useRef(GAME_DURATION);
  const lastInkRef = useRef(null);

  const makeNextQuestion = useCallback(() => {
    const next = createQuestion(lastInkRef.current);
    lastInkRef.current = next.ink.name;
    setQuestion(next);
  }, []);

  const finishGame = useCallback(() => {
    if (phaseRef.current !== 'playing') return;

    phaseRef.current = 'finished';
    setPhase('finished');
    setFeedback('Time is up!');
    setFeedbackClass('');

    const finalScore = scoreRef.current;
    const elapsedSeconds = GAME_DURATION - timeRef.current;

    setFeedbackCopy(
      `You scored ${finalScore} ${
        finalScore === 1 ? 'point' : 'points'
      }. Try again to beat your record.`
    );

    // Save the final score to the Flask leaderboard.
    setBackendSaveStatus('saving');

    saveGameScore({
      gameName: 'Chaos Colors',
      score: finalScore,
      durationSeconds: elapsedSeconds,
    })
      .then(() => {
        setBackendSaveStatus('saved');
      })
      .catch((error) => {
        console.error('Could not save Chaos Colors score:', error);
        setBackendSaveStatus('error');
      });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const intervalId = window.setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);

      if (timeRef.current <= 0) {
        window.clearInterval(intervalId);
        finishGame();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [phase, finishGame]);

  function startGame() {
    scoreRef.current = 0;
    streakRef.current = 0;
    timeRef.current = GAME_DURATION;
    phaseRef.current = 'playing';
    lastInkRef.current = null;

    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_DURATION);
    setPhase('playing');
    setBackendSaveStatus('idle');
    setFeedback('Go!');
    setFeedbackClass('');
    setFeedbackCopy(
      'Choose the colour of the letters, not what they spell.'
    );

    makeNextQuestion();
  }

  function handleAnswer(colorName) {
    if (phaseRef.current !== 'playing') return;

    if (colorName === question.ink.name) {
      const nextScore = scoreRef.current + 1;
      const nextStreak = streakRef.current + 1;

      scoreRef.current = nextScore;
      streakRef.current = nextStreak;

      setScore(nextScore);
      setStreak(nextStreak);

      setFeedback(
        nextStreak >= 5
          ? `${nextStreak} in a row! 🔥`
          : 'Correct! Nice focus.'
      );

      setFeedbackClass('correct');
      setFeedbackCopy('Good eyes. The next colour is coming up.');

      if (nextScore > best) {
        setBest(nextScore);

        try {
          localStorage.setItem(BEST_KEY, String(nextScore));
        } catch {
          // The current round still works when storage is unavailable.
        }
      }
    } else {
      streakRef.current = 0;
      setStreak(0);
      setFeedback('Not that colour!');
      setFeedbackClass('incorrect');
      setFeedbackCopy(
        `The ink was ${question.ink.name}. Keep your eyes on the letters.`
      );
    }

    makeNextQuestion();
  }

  return (
    <>
      <style>{styles}</style>

      <main className="colors-page">
        <div className="colors-wrap">
          {onBack && (
            <button
              className="colors-back"
              type="button"
              onClick={onBack}
            >
              ← Back to Arena
            </button>
          )}

          <header className="colors-heading">
            <div className="colors-eyebrow">CHAOS ARENA / GAME 07</div>

            <h1>
              CHAOS <span>COLORS</span>
            </h1>

            <p>
              Don't trust what the word says. Look at the colour of the
              letters and choose the matching colour below. You have 30
              seconds to get the highest score you can.
            </p>
          </header>

          <section className="colors-stats" aria-label="Game statistics">
            <div className="colors-stat">
              <div className="colors-stat-label">YOUR SCORE</div>
              <div className="colors-stat-value">{score}</div>
            </div>

            <div className="colors-stat">
              <div className="colors-stat-label">BEST SCORE</div>
              <div className="colors-stat-value">{best}</div>
            </div>

            <div className="colors-stat">
              <div className="colors-stat-label">TIME LEFT</div>
              <div className="colors-stat-value">{timeLeft}s</div>
            </div>
          </section>

          <section className="colors-panel">
            <div className="colors-panel-top">
              <div className="colors-panel-label">COLOUR CHALLENGE</div>

              <div className="colors-status">
                {phase === 'ready'
                  ? 'READY'
                  : phase === 'playing'
                    ? `${streak} STREAK`
                    : 'ROUND OVER'}
              </div>
            </div>

            <div className="colors-question">
              <div className="colors-question-label">
                WHICH COLOUR IS THE INK?
              </div>

              <div
                className="colors-word"
                style={{ color: question.ink.value }}
                aria-label={`The word ${question.word}, printed in ${question.ink.name} ink`}
              >
                {question.word}
              </div>

              <div className="colors-instruction">
                Choose the <strong>ink colour</strong>, not the word.
              </div>
            </div>

            <div className="colors-options">
              {question.options.map((color) => (
                <button
                  key={color.name}
                  className="colors-option"
                  type="button"
                  disabled={phase !== 'playing'}
                  onClick={() => handleAnswer(color.name)}
                >
                  <span
                    className="colors-swatch"
                    style={{
                      '--swatch-color': color.value,
                      background: color.value,
                    }}
                  />

                  {color.name}
                </button>
              ))}
            </div>

            <div className="colors-feedback" role="status" aria-live="polite">
              <div className={`colors-feedback-title ${feedbackClass}`}>
                {feedback}
              </div>

              <div className="colors-feedback-copy">{feedbackCopy}</div>

              {backendSaveStatus !== 'idle' && (
                <div className="colors-feedback-copy" aria-live="polite">
                  {backendSaveStatus === 'saving'
                    ? 'Saving your score to the leaderboard…'
                    : backendSaveStatus === 'saved'
                      ? 'Score saved to the leaderboard!'
                      : 'Could not save your score. Check that the backend is running.'}
                </div>
              )}
            </div>

            {phase !== 'playing' && (
              <button
                className="colors-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready' ? 'START GAME' : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="colors-help">
            Tip: read the letters' colour, not the word itself. Correct answers
            increase your score and streak. Your best score is saved in this
            browser.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosColors;