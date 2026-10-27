import { useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const GAME_DURATION = 30;
const STARTING_LIVES = 3;
const BEST_KEY = 'chaos-arena-chaos-freeze-best';

const styles = `
  .freeze-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .freeze-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .freeze-back {
    padding: 10px 15px;
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }

  .freeze-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .freeze-heading {
    margin: 32px 0 23px;
  }

  .freeze-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .freeze-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .freeze-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .freeze-heading p {
    max-width: 610px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .freeze-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 17px;
  }

  .freeze-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .freeze-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .freeze-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .freeze-panel {
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

  .freeze-panel-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
  }

  .freeze-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .freeze-lives {
    display: flex;
    gap: 6px;
    font-size: 18px;
  }

  .freeze-life {
    color: #ff8098;
    filter: drop-shadow(0 0 7px rgba(255,128,152,.25));
  }

  .freeze-life.lost {
    opacity: .23;
    filter: none;
  }

  .freeze-signal {
    width: 100%;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 13px;
    padding: 28px 18px;
    border: 1px solid rgba(193,165,255,.24);
    border-radius: 17px;
    background:
      radial-gradient(ellipse at center, rgba(167,139,250,.12), transparent 70%),
      rgba(255,255,255,.025);
    color: #d5c5ff;
    text-align: center;
    transition: background .2s, border-color .2s, box-shadow .2s;
  }

  .freeze-signal.go {
    color: #7af2bd;
    border-color: rgba(112,242,189,.7);
    background:
      radial-gradient(ellipse at center, rgba(62,220,154,.16), transparent 72%),
      rgba(255,255,255,.02);
    box-shadow: inset 0 0 30px rgba(62,220,154,.04);
  }

  .freeze-signal.stop {
    color: #ff93a5;
    border-color: rgba(255,125,142,.58);
    background:
      radial-gradient(ellipse at center, rgba(255,77,105,.13), transparent 72%),
      rgba(255,255,255,.02);
  }

  .freeze-signal.ready,
  .freeze-signal.finished {
    color: #d5c5ff;
  }

  .freeze-signal-icon {
    font-size: 42px;
    line-height: 1;
  }

  .freeze-signal-word {
    font: 900 clamp(45px, 10vw, 76px)/1 'Barlow Condensed', sans-serif;
    letter-spacing: 3px;
  }

  .freeze-signal.go .freeze-signal-word {
    text-shadow: 0 0 28px rgba(112,242,189,.22);
  }

  .freeze-signal.stop .freeze-signal-word {
    text-shadow: 0 0 28px rgba(255,125,142,.18);
  }

  .freeze-signal-help {
    max-width: 390px;
    color: #aaa2bd;
    font-size: 12px;
    line-height: 1.8;
  }

  .freeze-tap {
    width: 100%;
    margin-top: 18px;
    padding: 16px 18px;
    border: 1px solid rgba(225,210,255,.65);
    border-radius: 11px;
    color: #160d27;
    background: linear-gradient(110deg, #d0bbff, #9873f0);
    font: 700 11px 'Space Mono', monospace;
    letter-spacing: 1px;
    cursor: pointer;
    box-shadow: 0 8px 26px rgba(139,92,246,.2);
    transition: transform .18s, filter .18s, box-shadow .18s;
  }

  .freeze-tap:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.07);
    box-shadow: 0 12px 32px rgba(139,92,246,.3);
  }

  .freeze-tap:active:not(:disabled) {
    transform: scale(.985);
  }

  .freeze-tap.go {
    color: #06291c;
    border-color: rgba(165,255,214,.65);
    background: linear-gradient(110deg, #9bf7cf, #5fdbad);
    box-shadow: 0 8px 26px rgba(62,220,154,.15);
  }

  .freeze-tap.stop {
    color: #ffdfe4;
    border-color: rgba(255,125,142,.35);
    background: rgba(255,77,105,.1);
    box-shadow: none;
  }

  .freeze-tap:disabled {
    cursor: not-allowed;
    opacity: .65;
  }

  .freeze-feedback {
    min-height: 51px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin-top: 16px;
    text-align: center;
  }

  .freeze-feedback-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .freeze-feedback-text {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.6;
  }

  .freeze-action {
    width: 100%;
    padding: 14px 17px;
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

  .freeze-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .freeze-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .freeze-page { padding: 18px 12px; }
    .freeze-heading { margin-top: 26px; }
    .freeze-stats { gap: 7px; }
    .freeze-stat { padding: 11px; }
    .freeze-stat-label { font-size: 8px; letter-spacing: .2px; }
    .freeze-signal { min-height: 240px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .freeze-signal,
    .freeze-tap,
    .freeze-action { transition: none; }
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

function ChaosFreeze({ onBack }) {
  const [gamePhase, setGamePhase] = useState('ready');
  const [signal, setSignal] = useState('STOP');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState('');
  const [feedbackDetail, setFeedbackDetail] = useState('');
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const gamePhaseRef = useRef('ready');
  const signalRef = useRef('STOP');
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const timeLeftRef = useRef(GAME_DURATION);

  const signalTimeoutRef = useRef(null);
  const clockIntervalRef = useRef(null);

  function clearTimers() {
    window.clearTimeout(signalTimeoutRef.current);
    window.clearInterval(clockIntervalRef.current);
    signalTimeoutRef.current = null;
    clockIntervalRef.current = null;
  }

  useEffect(() => {
    return () => {
      gamePhaseRef.current = 'finished';
      clearTimers();
    };
  }, []);

  function finishGame(reason) {
    if (gamePhaseRef.current !== 'playing') return;

    gamePhaseRef.current = 'finished';
    signalRef.current = 'STOP';

    clearTimers();

    setGamePhase('finished');
    setSignal('STOP');

    if (reason === 'time') {
      setFeedback('Round complete!');
      setFeedbackDetail(`Time's up! You scored ${scoreRef.current} points.`);
    } else {
      setFeedback('Caught moving!');
      setFeedbackDetail(
        `You scored ${scoreRef.current} points. Take a breath and try again.`
      );
    }

    // Save the final score to the Flask leaderboard.
    const finalScore = scoreRef.current;
    const durationSeconds = Math.max(
      0,
      GAME_DURATION - timeLeftRef.current
    );

    setBackendSaveStatus('saving');

    saveGameScore({
      gameName: 'Chaos Freeze',
      score: finalScore,
      durationSeconds,
    })
      .then(() => {
        setBackendSaveStatus('saved');
      })
      .catch((error) => {
        console.error('Could not save Chaos Freeze score:', error);
        setBackendSaveStatus('error');
      });
  }

  function scheduleSignalChange() {
    signalTimeoutRef.current = window.setTimeout(() => {
      if (gamePhaseRef.current !== 'playing') return;

      const nextSignal = signalRef.current === 'STOP' ? 'GO' : 'STOP';

      signalRef.current = nextSignal;
      setSignal(nextSignal);

      if (nextSignal === 'GO') {
        setFeedback('Your turn!');
        setFeedbackDetail('Tap the button to earn a point.');
      } else {
        setFeedback('Freeze!');
        setFeedbackDetail("Don't tap while the signal says STOP.");
      }

      scheduleSignalChange();
    }, 650 + Math.random() * 1500);
  }

  function startGame() {
    clearTimers();

    gamePhaseRef.current = 'playing';
    signalRef.current = 'STOP';
    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;
    timeLeftRef.current = GAME_DURATION;

    setGamePhase('playing');
    setSignal('STOP');
    setScore(0);
    setLives(STARTING_LIVES);
    setTimeLeft(GAME_DURATION);
    setBackendSaveStatus('idle');

    setFeedback('Get ready...');
    setFeedbackDetail(
      'Wait for GO before you tap. Starting on STOP costs a life.'
    );

    scheduleSignalChange();

    clockIntervalRef.current = window.setInterval(() => {
      if (gamePhaseRef.current !== 'playing') return;

      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        finishGame('time');
      }
    }, 1000);
  }

  function handleTap() {
    if (gamePhaseRef.current !== 'playing') return;

    if (signalRef.current === 'STOP') {
      const remainingLives = Math.max(0, livesRef.current - 1);

      livesRef.current = remainingLives;
      setLives(remainingLives);

      setFeedback('Too slow to freeze!');
      setFeedbackDetail(
        remainingLives > 0
          ? `You lost a life. ${remainingLives} ${
              remainingLives === 1 ? 'life remains' : 'lives remain'
            }.`
          : 'No lives left.'
      );

      if (remainingLives === 0) {
        finishGame('lives');
      }

      return;
    }

    const nextScore = scoreRef.current + 1;

    scoreRef.current = nextScore;
    setScore(nextScore);
    setFeedback('Nice reflexes!');
    setFeedbackDetail(
      `You have ${nextScore} ${
        nextScore === 1 ? 'point' : 'points'
      }. Stay ready for STOP.`
    );

    if (nextScore > best) {
      setBest(nextScore);

      try {
        localStorage.setItem(BEST_KEY, String(nextScore));
      } catch {
        // The game remains playable when local storage is unavailable.
      }
    }
  }

  const isPlaying = gamePhase === 'playing';
  const signalLabel = isPlaying
    ? signal
    : gamePhase === 'ready'
      ? 'READY?'
      : 'ROUND OVER';

  const signalIcon = isPlaying
    ? signal === 'GO'
      ? '🟢'
      : '🔴'
    : gamePhase === 'ready'
      ? '⚡'
      : '🏁';

  const signalClass = isPlaying
    ? signal.toLowerCase()
    : gamePhase === 'ready'
      ? 'ready'
      : 'finished';

  return (
    <>
      <style>{styles}</style>

      <main className="freeze-page">
        <div className="freeze-wrap">
          {onBack && (
            <button
              className="freeze-back"
              type="button"
              onClick={() => {
                clearTimers();
                gamePhaseRef.current = 'finished';
                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="freeze-heading">
            <div className="freeze-eyebrow">CHAOS ARENA / GAME 03</div>
            <h1>
              CHAOS <span>FREEZE</span>
            </h1>
            <p>
              Stay alert. Tap during GO, then keep your hands still during
              STOP. You have three lives and 30 seconds to score as many
              points as possible.
            </p>
          </header>

          <section className="freeze-stats" aria-label="Game statistics">
            <div className="freeze-stat">
              <div className="freeze-stat-label">YOUR SCORE</div>
              <div className="freeze-stat-value">{score}</div>
            </div>

            <div className="freeze-stat">
              <div className="freeze-stat-label">PERSONAL BEST</div>
              <div className="freeze-stat-value">{best}</div>
            </div>

            <div className="freeze-stat">
              <div className="freeze-stat-label">TIME LEFT</div>
              <div className="freeze-stat-value">{timeLeft}s</div>
            </div>
          </section>

          <section className="freeze-panel">
            <div className="freeze-panel-top">
              <div className="freeze-panel-label">REACTION CHALLENGE</div>

              <div
                className="freeze-lives"
                aria-label={`${lives} lives remaining`}
              >
                {Array.from({ length: STARTING_LIVES }, (_, index) => (
                  <span
                    className={`freeze-life ${index >= lives ? 'lost' : ''}`}
                    key={index}
                  >
                    ♥
                  </span>
                ))}
              </div>
            </div>

            <div className={`freeze-signal ${signalClass}`} aria-live="polite">
              <div className="freeze-signal-icon">{signalIcon}</div>
              <div className="freeze-signal-word">{signalLabel}</div>

              <div className="freeze-signal-help">
                {gamePhase === 'ready'
                  ? 'Start the game and watch the signal carefully.'
                  : isPlaying
                    ? signal === 'GO'
                      ? 'Tap below now to collect a point!'
                      : 'Hands off! Wait for GO.'
                    : `Final score: ${score} ${
                        score === 1 ? 'point' : 'points'
                      }.`}
              </div>
            </div>

            {isPlaying && (
              <button
                className={`freeze-tap ${signal.toLowerCase()}`}
                type="button"
                onClick={handleTap}
              >
                {signal === 'GO' ? 'TAP TO SCORE' : "DON'T TAP — FREEZE!"}
              </button>
            )}

            <div className="freeze-feedback" role="status" aria-live="polite">
              <div className="freeze-feedback-title">{feedback}</div>
              <div className="freeze-feedback-text">{feedbackDetail}</div>

              {backendSaveStatus !== 'idle' && (
                <div className="freeze-feedback-text" aria-live="polite">
                  {backendSaveStatus === 'saving'
                    ? 'Saving your score to the leaderboard…'
                    : backendSaveStatus === 'saved'
                      ? 'Score saved to the leaderboard!'
                      : 'Could not save your score. Check that the backend is running.'}
                </div>
              )}
            </div>

            {!isPlaying && (
              <button
                className="freeze-action"
                type="button"
                onClick={startGame}
              >
                {gamePhase === 'ready' ? 'START GAME' : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="freeze-help">
            Every GO signal is a chance to score. Every STOP signal is a test
            of self-control. The signals change at random intervals, so don't
            tap on autopilot.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosFreeze;