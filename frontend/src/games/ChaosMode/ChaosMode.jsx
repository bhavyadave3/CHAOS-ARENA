import { useCallback, useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const GAME_DURATION = 45;
const STARTING_LIVES = 3;
const BEST_KEY = 'chaos-arena-chaos-mode-best';

const COLORS = [
  { name: 'RED', value: '#ff647c' },
  { name: 'BLUE', value: '#7196ff' },
  { name: 'GREEN', value: '#5ce0a5' },
  { name: 'YELLOW', value: '#f4d76c' },
  { name: 'PURPLE', value: '#b49aff' },
  { name: 'PINK', value: '#ff88cb' },
];

const styles = `
  .mode-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.18), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .mode-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .mode-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
  }

  .mode-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .mode-heading {
    margin: 32px 0 23px;
  }

  .mode-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .mode-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .mode-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .mode-heading p {
    max-width: 620px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .mode-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 17px;
  }

  .mode-stat {
    padding: 15px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .mode-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .5px;
  }

  .mode-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(20px, 4vw, 29px) 'Barlow Condensed', sans-serif;
  }

  .mode-panel {
    padding: clamp(17px, 4vw, 32px);
    border: 1px solid rgba(193,165,255,.22);
    border-radius: 19px;
    background:
      radial-gradient(ellipse at top, rgba(139,92,246,.14), transparent 60%),
      rgba(20,16,34,.75);
    box-shadow:
      0 25px 70px rgba(0,0,0,.25),
      inset 0 1px 0 rgba(255,255,255,.055);
  }

  .mode-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .mode-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.2px;
  }

  .mode-status {
    color: #aaa2bd;
    font: 9px 'Space Mono', monospace;
    text-align: right;
  }

  .mode-challenge {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 26px 16px;
    border: 1px solid rgba(193,165,255,.16);
    border-radius: 15px;
    background:
      radial-gradient(ellipse at center, rgba(167,139,250,.10), transparent 72%),
      rgba(255,255,255,.02);
    text-align: center;
  }

  .mode-challenge.color {
    background:
      radial-gradient(ellipse at center, rgba(255,136,203,.08), transparent 72%),
      rgba(255,255,255,.02);
  }

  .mode-challenge.math {
    background:
      radial-gradient(ellipse at center, rgba(109,140,255,.10), transparent 72%),
      rgba(255,255,255,.02);
  }

  .mode-challenge.reaction {
    background:
      radial-gradient(ellipse at center, rgba(112,242,189,.075), transparent 72%),
      rgba(255,255,255,.02);
  }

  .mode-challenge-icon {
    font-size: 34px;
    line-height: 1;
  }

  .mode-challenge-type {
    color: #a79abd;
    font: 9px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .mode-prompt {
    max-width: 100%;
    overflow-wrap: anywhere;
    color: #f1eaff;
    font: 800 clamp(29px, 7vw, 48px)/1.1 'Barlow Condensed', sans-serif;
  }

  .mode-prompt.color-word {
    font-size: clamp(42px, 10vw, 75px);
    letter-spacing: 2px;
  }

  .mode-prompt.reaction-ready {
    color: #ff99ab;
  }

  .mode-prompt.reaction-go {
    color: #7af2bd;
    text-shadow: 0 0 28px rgba(112,242,189,.2);
  }

  .mode-challenge-help {
    max-width: 410px;
    color: #aca4c1;
    font-size: 12px;
    line-height: 1.8;
  }

  .mode-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
    margin-top: 7px;
  }

  .mode-option {
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 12px 8px;
    border: 1px solid rgba(193,165,255,.18);
    border-radius: 10px;
    background: rgba(255,255,255,.035);
    color: #e9e1ff;
    font: 700 11px 'Space Mono', monospace;
    cursor: pointer;
    transition: transform .17s, background .17s, border-color .17s;
  }

  .mode-option:hover:not(:disabled) {
    transform: translateY(-2px);
    background: rgba(167,139,250,.1);
    border-color: rgba(193,165,255,.5);
  }

  .mode-option:active:not(:disabled) {
    transform: scale(.98);
  }

  .mode-option:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .mode-option:focus-visible,
  .mode-action:focus-visible {
    outline: 2px solid #d0bbff;
    outline-offset: 3px;
  }

  .mode-swatch {
    width: 13px;
    height: 13px;
    flex: 0 0 13px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.45);
  }

  .mode-reaction-button {
    width: 100%;
    margin-top: 10px;
    padding: 16px;
    border: 1px solid rgba(225,210,255,.65);
    border-radius: 10px;
    color: #160d27;
    background: linear-gradient(110deg, #d0bbff, #9873f0);
    font: 700 11px 'Space Mono', monospace;
    letter-spacing: .8px;
    cursor: pointer;
    box-shadow: 0 8px 26px rgba(139,92,246,.18);
    transition: transform .18s, filter .18s, background .18s;
  }

  .mode-reaction-button.go {
    color: #06291c;
    background: linear-gradient(110deg, #a0f7d2, #5fdbad);
    border-color: rgba(165,255,214,.6);
    box-shadow: 0 8px 28px rgba(62,220,154,.14);
  }

  .mode-reaction-button:hover:not(:disabled) {
    filter: brightness(1.07);
    transform: translateY(-2px);
  }

  .mode-reaction-button:active:not(:disabled) {
    transform: scale(.99);
  }

  .mode-reaction-button:disabled {
    cursor: not-allowed;
    opacity: .65;
  }

  .mode-feedback {
    min-height: 57px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin: 16px 0 10px;
    text-align: center;
  }

  .mode-feedback-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .mode-feedback-title.correct {
    color: #7af2bd;
  }

  .mode-feedback-title.incorrect {
    color: #ff91a4;
  }

  .mode-feedback-copy {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .mode-action {
    width: 100%;
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

  .mode-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .mode-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .mode-page { padding: 18px 12px; }
    .mode-heading { margin-top: 26px; }
    .mode-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .mode-stat { padding: 12px; }
    .mode-stat-label { font-size: 8px; letter-spacing: .2px; }
    .mode-challenge { min-height: 260px; padding: 20px 10px; }
    .mode-options { gap: 7px; }
    .mode-option { font-size: 9px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-option,
    .mode-action,
    .mode-reaction-button { transition: none; }
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

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeOptions(correctAnswer, distractors) {
  const uniqueDistractors = [
    ...new Set(distractors.filter((value) => value !== correctAnswer)),
  ].slice(0, 3);

  while (uniqueDistractors.length < 3) {
    const offset = Math.floor(Math.random() * 9) + 1;
    const candidate = String(Number(correctAnswer) + offset);

    if (
      candidate !== correctAnswer &&
      !uniqueDistractors.includes(candidate)
    ) {
      uniqueDistractors.push(candidate);
    }
  }

  return shuffle([correctAnswer, ...uniqueDistractors]);
}

function createChallenge(previousType = null) {
  const types = ['color', 'math', 'reaction'];
  const available = types.filter((type) => type !== previousType);
  const type = available[Math.floor(Math.random() * available.length)];

  if (type === 'color') {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const inkChoices = COLORS.filter((color) => color.name !== word.name);
    const ink = inkChoices[Math.floor(Math.random() * inkChoices.length)];

    const otherOptions = shuffle(
      COLORS.filter((color) => color.name !== ink.name)
    ).slice(0, 3);

    return {
      type,
      word: word.name,
      ink,
      correctAnswer: ink.name,
      options: shuffle([ink, ...otherOptions]),
    };
  }

  if (type === 'math') {
    const a = Math.floor(Math.random() * 12) + 3;
    const b = Math.floor(Math.random() * 9) + 2;
    const operations = ['+', '−', '×'];
    const operation =
      operations[Math.floor(Math.random() * operations.length)];

    let answer;

    if (operation === '+') answer = a + b;
    else if (operation === '−') answer = a - b;
    else answer = a * b;

    const correctAnswer = String(answer);

    return {
      type,
      prompt: `${a} ${operation} ${b} = ?`,
      correctAnswer,
      options: makeOptions(correctAnswer, [
        String(answer + 1),
        String(answer - 1),
        String(answer + 3),
        String(answer - 2),
      ]),
    };
  }

  return {
    type: 'reaction',
    signal: 'wait',
  };
}

function ChaosMode({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [challenge, setChallenge] = useState(() => createChallenge());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [resolving, setResolving] = useState(false);
  const [feedback, setFeedback] = useState('Ready for anything?');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [feedbackCopy, setFeedbackCopy] = useState(
    'The challenge changes every round. Stay sharp.'
  );
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const phaseRef = useRef('ready');
  const challengeRef = useRef(challenge);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const timeRef = useRef(GAME_DURATION);
  const resolvingRef = useRef(false);
  const advanceTimerRef = useRef(null);
  const reactionTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    window.clearTimeout(advanceTimerRef.current);
    window.clearTimeout(reactionTimerRef.current);
    advanceTimerRef.current = null;
    reactionTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      phaseRef.current = 'finished';
      clearTimers();
    };
  }, [clearTimers]);

  // Finish the game and save its final score.
  // This runs for both timeout and the last lost life.
  const finishGame = useCallback((reason = 'time') => {
    if (phaseRef.current !== 'playing') return;

    phaseRef.current = 'finished';
    setPhase('finished');
    setResolving(false);
    resolvingRef.current = false;
    clearTimers();

    const finalScore = scoreRef.current;
    const durationSeconds = Math.max(
      0,
      GAME_DURATION - timeRef.current
    );

    setFeedbackClass('');

    if (reason === 'lives') {
      setFeedback('No lives left!');
      setFeedbackCopy(
        `You scored ${finalScore} ${
          finalScore === 1 ? 'point' : 'points'
        }. Try another run to beat your best.`
      );
    } else {
      setFeedback("Time's up!");
      setFeedbackCopy(
        `You scored ${finalScore} ${
          finalScore === 1 ? 'point' : 'points'
        }. Try another run to beat your best.`
      );
    }

    setBackendSaveStatus('saving');

    saveGameScore({
      gameName: 'Chaos Mode',
      score: finalScore,
      durationSeconds,
    })
      .then(() => {
        setBackendSaveStatus('saved');
      })
      .catch((error) => {
        console.error('Could not save Chaos Mode score:', error);
        setBackendSaveStatus('error');
      });
  }, [clearTimers]);

  const nextChallenge = useCallback((previousType) => {
    if (phaseRef.current !== 'playing') return;

    clearTimers();

    const next = createChallenge(previousType);
    challengeRef.current = next;

    setChallenge(next);
    setResolving(false);
    resolvingRef.current = false;
  }, [clearTimers]);

  // Reaction challenges turn green after a random delay.
  useEffect(() => {
    if (
      phase !== 'playing' ||
      challenge.type !== 'reaction' ||
      challenge.signal !== 'wait' ||
      resolving
    ) {
      return undefined;
    }

    reactionTimerRef.current = window.setTimeout(() => {
      if (
        phaseRef.current !== 'playing' ||
        resolvingRef.current ||
        challengeRef.current.type !== 'reaction'
      ) {
        return;
      }

      const next = {
        ...challengeRef.current,
        signal: 'go',
      };

      challengeRef.current = next;
      setChallenge(next);
      setFeedback('NOW!');
      setFeedbackClass('');
      setFeedbackCopy('Click only when the signal turns green.');
    }, 850 + Math.random() * 1900);

    return () => {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    };
  }, [phase, challenge, resolving]);

  // Overall game timer.
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const timerId = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return;

      timeRef.current -= 1;
      setTimeLeft(timeRef.current);

      if (timeRef.current <= 0) {
        window.clearInterval(timerId);
        finishGame('time');
      }
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [phase, finishGame]);

  const startGame = useCallback(() => {
    clearTimers();

    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;
    timeRef.current = GAME_DURATION;
    resolvingRef.current = false;

    const firstChallenge = createChallenge();

    challengeRef.current = firstChallenge;
    phaseRef.current = 'playing';

    setPhase('playing');
    setChallenge(firstChallenge);
    setScore(0);
    setLives(STARTING_LIVES);
    setTimeLeft(GAME_DURATION);
    setResolving(false);
    setBackendSaveStatus('idle');
    setFeedback('Here we go!');
    setFeedbackClass('');
    setFeedbackCopy('Read each challenge carefully before you answer.');
  }, [clearTimers]);

  const handleWrongAnswer = useCallback((message, previousType) => {
    if (phaseRef.current !== 'playing' || resolvingRef.current) return;

    resolvingRef.current = true;
    setResolving(true);

    const remainingLives = livesRef.current - 1;

    livesRef.current = remainingLives;
    setLives(remainingLives);
    setFeedback(message);
    setFeedbackClass('incorrect');

    if (remainingLives <= 0) {
      finishGame('lives');
      return;
    }

    setFeedbackCopy(
      `${remainingLives} ${
        remainingLives === 1 ? 'life' : 'lives'
      } left. The next challenge is coming up.`
    );

    advanceTimerRef.current = window.setTimeout(() => {
      nextChallenge(previousType);
    }, 650);
  }, [finishGame, nextChallenge]);

  const handleCorrectAnswer = useCallback((previousType, detail) => {
    if (phaseRef.current !== 'playing' || resolvingRef.current) return;

    resolvingRef.current = true;
    setResolving(true);

    const nextScore = scoreRef.current + 1;

    scoreRef.current = nextScore;
    setScore(nextScore);

    setFeedback('Correct!');
    setFeedbackClass('correct');
    setFeedbackCopy(
      detail || 'Nice work. Get ready for the next challenge.'
    );

    if (nextScore > best) {
      setBest(nextScore);

      try {
        localStorage.setItem(BEST_KEY, String(nextScore));
      } catch {
        // Keep the current game running if storage is unavailable.
      }
    }

    advanceTimerRef.current = window.setTimeout(() => {
      nextChallenge(previousType);
    }, 550);
  }, [best, nextChallenge]);

  const handleOption = useCallback((answer) => {
    if (
      phaseRef.current !== 'playing' ||
      resolvingRef.current
    ) {
      return;
    }

    const current = challengeRef.current;

    if (current.type === 'reaction') return;

    if (answer === current.correctAnswer) {
      handleCorrectAnswer(
        current.type,
        current.type === 'color'
          ? `That's the ${current.ink.name} ink. Good eyes!`
          : 'Math checked out. Next challenge!'
      );
    } else {
      handleWrongAnswer(
        current.type === 'color'
          ? `Not that colour. The ink was ${current.ink.name}.`
          : `Not quite. The correct answer was ${current.correctAnswer}.`,
        current.type
      );
    }
  }, [handleCorrectAnswer, handleWrongAnswer]);

  const handleReactionClick = useCallback(() => {
    if (
      phaseRef.current !== 'playing' ||
      resolvingRef.current ||
      challengeRef.current.type !== 'reaction'
    ) {
      return;
    }

    const current = challengeRef.current;

    if (current.signal !== 'go') {
      handleWrongAnswer('False start!', current.type);
    } else {
      handleCorrectAnswer(
        current.type,
        'Fast reaction. Keep it going!'
      );
    }
  }, [handleCorrectAnswer, handleWrongAnswer]);

  const livesText = '♥ '.repeat(lives).trim() || '0';

  return (
    <>
      <style>{styles}</style>

      <main className="mode-page">
        <div className="mode-wrap">
          {onBack && (
            <button
              className="mode-back"
              type="button"
              onClick={() => {
                clearTimers();
                phaseRef.current = 'finished';
                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="mode-heading">
            <div className="mode-eyebrow">CHAOS ARENA / GAME 09</div>
            <h1>
              CHAOS <span>MODE</span>
            </h1>
            <p>
              No two rounds are the same. React to signals, identify ink
              colours, solve quick maths, and keep going until time runs out
              or you lose all three lives.
            </p>
          </header>

          <section className="mode-stats" aria-label="Game statistics">
            <div className="mode-stat">
              <div className="mode-stat-label">SCORE</div>
              <div className="mode-stat-value">{score}</div>
            </div>

            <div className="mode-stat">
              <div className="mode-stat-label">PERSONAL BEST</div>
              <div className="mode-stat-value">{best}</div>
            </div>

            <div className="mode-stat">
              <div className="mode-stat-label">TIME LEFT</div>
              <div className="mode-stat-value">{timeLeft}s</div>
            </div>

            <div className="mode-stat">
              <div className="mode-stat-label">LIVES</div>
              <div
                className="mode-stat-value"
                style={{
                  color: lives > 1 ? '#ff91bd' : '#ff899c',
                }}
              >
                {livesText}
              </div>
            </div>
          </section>

          <section className="mode-panel">
            <div className="mode-panel-top">
              <div className="mode-panel-label">CHALLENGE ARENA</div>
              <div className="mode-status">
                {phase === 'ready'
                  ? 'READY'
                  : phase === 'playing'
                    ? 'RULES MAY CHANGE'
                    : 'ROUND OVER'}
              </div>
            </div>

            {phase === 'ready' ? (
              <div className="mode-challenge">
                <div className="mode-challenge-icon">☠️</div>
                <div className="mode-challenge-type">
                  ULTIMATE CHALLENGE
                </div>
                <div className="mode-prompt">EXPECT ANYTHING</div>
                <div className="mode-challenge-help">
                  Answer correctly to score points. Wrong answers cost a life.
                  Reaction challenges require you to wait for the green signal.
                </div>
              </div>
            ) : phase === 'finished' ? (
              <div className="mode-challenge">
                <div className="mode-challenge-icon">🏁</div>
                <div className="mode-challenge-type">FINAL SCORE</div>
                <div className="mode-prompt">{score} POINTS</div>
                <div className="mode-challenge-help">
                  {score >= best && score > 0
                    ? 'Great run! You matched or beat your best.'
                    : 'Ready for another round? See if you can beat your record.'}
                </div>
              </div>
            ) : (
              <div className={`mode-challenge ${challenge.type}`}>
                <div className="mode-challenge-icon">
                  {challenge.type === 'color'
                    ? '🎨'
                    : challenge.type === 'math'
                      ? '🧠'
                      : challenge.signal === 'go'
                        ? '🟢'
                        : '🔴'}
                </div>

                <div className="mode-challenge-type">
                  {challenge.type === 'color'
                    ? 'COLOUR CHECK'
                    : challenge.type === 'math'
                      ? 'QUICK MATHS'
                      : 'REACTION TEST'}
                </div>

                {challenge.type === 'color' && (
                  <>
                    <div
                      className="mode-prompt color-word"
                      style={{ color: challenge.ink.value }}
                    >
                      {challenge.word}
                    </div>

                    <div className="mode-challenge-help">
                      Choose the <strong>ink colour</strong>, not the word.
                    </div>
                  </>
                )}

                {challenge.type === 'math' && (
                  <>
                    <div className="mode-prompt">
                      {challenge.prompt}
                    </div>

                    <div className="mode-challenge-help">
                      Work it out and select the correct answer.
                    </div>
                  </>
                )}

                {challenge.type === 'reaction' && (
                  <>
                    <div
                      className={`mode-prompt ${
                        challenge.signal === 'go'
                          ? 'reaction-go'
                          : 'reaction-ready'
                      }`}
                    >
                      {challenge.signal === 'go'
                        ? 'CLICK NOW!'
                        : 'WAIT...'}
                    </div>

                    <div className="mode-challenge-help">
                      {challenge.signal === 'go'
                        ? 'The signal is green. Click the button now!'
                        : 'Wait for green. Clicking early costs a life.'}
                    </div>
                  </>
                )}

                {challenge.type !== 'reaction' && (
                  <div className="mode-options">
                    {challenge.options.map((option) => {
                      const value =
                        typeof option === 'string'
                          ? option
                          : option.name;

                      return (
                        <button
                          key={value}
                          className="mode-option"
                          type="button"
                          disabled={resolving}
                          onClick={() => handleOption(value)}
                        >
                          {typeof option !== 'string' && (
                            <span
                              className="mode-swatch"
                              style={{ background: option.value }}
                            />
                          )}

                          {value}
                        </button>
                      );
                    })}
                  </div>
                )}

                {challenge.type === 'reaction' && (
                  <button
                    className={`mode-reaction-button ${
                      challenge.signal === 'go' ? 'go' : ''
                    }`}
                    type="button"
                    onClick={handleReactionClick}
                    disabled={resolving}
                  >
                    {challenge.signal === 'go'
                      ? 'CLICK TO SCORE'
                      : "DON'T CLICK YET"}
                  </button>
                )}
              </div>
            )}

            <div className="mode-feedback" role="status" aria-live="polite">
              <div className={`mode-feedback-title ${feedbackClass}`}>
                {feedback}
              </div>

              <div className="mode-feedback-copy">
                {feedbackCopy}
              </div>

              {backendSaveStatus !== 'idle' && (
                <div className="mode-feedback-copy" aria-live="polite">
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
                className="mode-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready'
                  ? 'START CHAOS MODE'
                  : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="mode-help">
            Three challenge types. Three lives. Forty-five seconds. Your best
            score is saved in this browser. Stay focused—the rules can change
            every round.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosMode;