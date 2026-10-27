import { useCallback, useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const GAME_DURATION = 30;
const BEST_KEY = 'chaos-arena-chaos-target-best';

const styles = `
  .target-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .target-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .target-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
  }

  .target-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .target-heading {
    margin: 32px 0 23px;
  }

  .target-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .target-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .target-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .target-heading p {
    max-width: 610px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .target-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 17px;
  }

  .target-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .target-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .target-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .target-panel {
    padding: clamp(16px, 4vw, 30px);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 19px;
    background:
      radial-gradient(ellipse at top, rgba(139,92,246,.12), transparent 60%),
      rgba(20,16,34,.72);
    box-shadow:
      0 25px 70px rgba(0,0,0,.25),
      inset 0 1px 0 rgba(255,255,255,.05);
  }

  .target-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .target-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .target-status {
    color: #a9a1bf;
    font: 9px 'Space Mono', monospace;
  }

  .target-arena {
    position: relative;
    height: clamp(280px, 48vw, 390px);
    overflow: hidden;
    border: 1px solid rgba(193,165,255,.19);
    border-radius: 14px;
    background:
      linear-gradient(rgba(193,165,255,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(193,165,255,.035) 1px, transparent 1px),
      radial-gradient(ellipse at center, rgba(139,92,246,.13), transparent 70%),
      rgba(5,4,13,.45);
    background-size: 28px 28px, 28px 28px, auto, auto;
  }

  .target-arena::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255,255,255,.025);
    border-radius: inherit;
    pointer-events: none;
  }

  .target-arena-hint {
    position: absolute;
    top: 15px;
    left: 10px;
    right: 10px;
    color: #8f85ab;
    font: 9px 'Space Mono', monospace;
    letter-spacing: 1px;
    text-align: center;
    pointer-events: none;
  }

  .target-crosshair {
    position: absolute;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    padding: 0;
    border: 2px solid rgba(255,137,176,.9);
    border-radius: 50%;
    color: #fff;
    background:
      radial-gradient(circle, rgba(255,112,165,.25), rgba(127,54,144,.18));
    box-shadow:
      0 0 14px rgba(255,111,170,.35),
      inset 0 0 14px rgba(255,111,170,.16);
    cursor: crosshair;
    transform: translate(-50%, -50%);
    transition:
      left .16s ease,
      top .16s ease,
      background .14s,
      box-shadow .14s;
    -webkit-tap-highlight-color: transparent;
  }

  .target-crosshair:hover {
    background: rgba(255,112,165,.35);
    box-shadow: 0 0 25px rgba(255,111,170,.55);
  }

  .target-crosshair:active {
    transform: translate(-50%, -50%) scale(.88);
  }

  .target-crosshair:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
  }

  .target-crosshair:disabled {
    cursor: default;
    opacity: .45;
  }

  .target-crosshair::before,
  .target-crosshair::after {
    content: '';
    position: absolute;
    background: rgba(255,177,211,.9);
    pointer-events: none;
  }

  .target-crosshair::before {
    width: 1px;
    height: 72px;
  }

  .target-crosshair::after {
    width: 72px;
    height: 1px;
  }

  .target-core {
    z-index: 1;
    width: 17px;
    height: 17px;
    border: 2px solid #ffe6f1;
    border-radius: 50%;
    background: #fb80b6;
    box-shadow: 0 0 12px rgba(255,128,181,.7);
  }

  .target-arena-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 110px;
    height: 110px;
    border: 1px dashed rgba(193,165,255,.13);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .target-ready,
  .target-finished {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 11px;
    padding: 25px;
    background: rgba(8,7,17,.77);
    backdrop-filter: blur(8px);
    text-align: center;
  }

  .target-overlay-icon {
    font-size: 36px;
  }

  .target-overlay-title {
    color: #e7dcff;
    font: 900 clamp(27px, 5vw, 38px) 'Barlow Condensed', sans-serif;
  }

  .target-overlay-copy {
    max-width: 330px;
    color: #aaa2bd;
    font-size: 12px;
    line-height: 1.8;
  }

  .target-feedback {
    min-height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin: 15px 0 10px;
    text-align: center;
  }

  .target-feedback-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .target-feedback-copy {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .target-action {
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

  .target-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .target-action:active {
    transform: scale(.99);
  }

  .target-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .target-page { padding: 18px 12px; }
    .target-heading { margin-top: 26px; }
    .target-stats { gap: 7px; }
    .target-stat { padding: 11px; }
    .target-stat-label { font-size: 8px; letter-spacing: .2px; }
    .target-crosshair { width: 50px; height: 50px; }
    .target-crosshair::before { height: 64px; }
    .target-crosshair::after { width: 64px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .target-crosshair,
    .target-action { transition: none; }
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

function getRandomPosition(previous) {
  let next = {
    x: 20 + Math.random() * 60,
    y: 25 + Math.random() * 55,
  };

  let attempts = 0;

  while (
    previous &&
    Math.abs(next.x - previous.x) +
      Math.abs(next.y - previous.y) <
      28 &&
    attempts < 15
  ) {
    next = {
      x: 20 + Math.random() * 60,
      y: 25 + Math.random() * 55,
    };

    attempts += 1;
  }

  return next;
}

function ChaosTarget({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [position, setPosition] = useState({ x: 50, y: 55 });
  const [feedback, setFeedback] = useState('Ready to test your aim?');
  const [feedbackCopy, setFeedbackCopy] = useState(
    'Start the round and hit the moving target as many times as you can.'
  );
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const phaseRef = useRef('ready');
  const timeRef = useRef(GAME_DURATION);
  const scoreRef = useRef(0);
  const positionRef = useRef({ x: 50, y: 55 });

  const finishGame = useCallback(() => {
    if (phaseRef.current !== 'playing') return;

    phaseRef.current = 'finished';
    setPhase('finished');
    setFeedback('Time is up!');

    const finalScore = scoreRef.current;

    setFeedbackCopy(
      `You hit ${finalScore} ${
        finalScore === 1 ? 'target' : 'targets'
      }. Try another round to beat your record.`
    );

    // Save the final score to the Flask leaderboard.
    setBackendSaveStatus('saving');

    saveGameScore({
      gameName: 'Chaos Target',
      score: finalScore,
      durationSeconds: GAME_DURATION,
    })
      .then(() => {
        setBackendSaveStatus('saved');
      })
      .catch((error) => {
        console.error('Could not save Chaos Target score:', error);
        setBackendSaveStatus('error');
      });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const clockId = window.setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);

      if (timeRef.current <= 0) {
        window.clearInterval(clockId);
        finishGame();
      }
    }, 1000);

    const movementId = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return;

      const nextPosition = getRandomPosition(positionRef.current);
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }, 900);

    return () => {
      window.clearInterval(clockId);
      window.clearInterval(movementId);
    };
  }, [phase, finishGame]);

  function startGame() {
    phaseRef.current = 'playing';
    timeRef.current = GAME_DURATION;
    scoreRef.current = 0;
    positionRef.current = { x: 50, y: 55 };

    setPhase('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setPosition(positionRef.current);
    setBackendSaveStatus('idle');
    setFeedback('Go!');
    setFeedbackCopy('Hit the target before it moves again.');
  }

  function hitTarget(event) {
    event.stopPropagation();

    if (phaseRef.current !== 'playing') return;

    const nextScore = scoreRef.current + 1;

    scoreRef.current = nextScore;
    setScore(nextScore);

    if (nextScore > best) {
      setBest(nextScore);

      try {
        localStorage.setItem(BEST_KEY, String(nextScore));
      } catch {
        // Keep the game playable if storage is unavailable.
      }
    }

    setFeedback(
      nextScore % 10 === 0
        ? 'Excellent aim!'
        : nextScore % 5 === 0
          ? 'Nice streak!'
          : 'Good shot!'
    );

    setFeedbackCopy(
      nextScore >= 10
        ? `${nextScore} hits so far. Keep going!`
        : 'Keep your eyes on the target. It moves every second.'
    );

    const nextPosition = getRandomPosition(positionRef.current);

    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }

  return (
    <>
      <style>{styles}</style>

      <main className="target-page">
        <div className="target-wrap">
          {onBack && (
            <button
              className="target-back"
              type="button"
              onClick={onBack}
            >
              ← Back to Arena
            </button>
          )}

          <header className="target-heading">
            <div className="target-eyebrow">CHAOS ARENA / GAME 06</div>
            <h1>
              CHAOS <span>TARGET</span>
            </h1>
            <p>
              Test your accuracy. You have 30 seconds to hit the moving target
              as many times as possible. Keep your eyes open—it won't stay in
              one place for long.
            </p>
          </header>

          <section className="target-stats" aria-label="Game statistics">
            <div className="target-stat">
              <div className="target-stat-label">TARGETS HIT</div>
              <div className="target-stat-value">{score}</div>
            </div>

            <div className="target-stat">
              <div className="target-stat-label">PERSONAL BEST</div>
              <div className="target-stat-value">{best}</div>
            </div>

            <div className="target-stat">
              <div className="target-stat-label">TIME LEFT</div>
              <div className="target-stat-value">{timeLeft}s</div>
            </div>
          </section>

          <section className="target-panel">
            <div className="target-panel-top">
              <div className="target-panel-label">AIMING RANGE</div>
              <div className="target-status">
                {phase === 'ready'
                  ? 'READY'
                  : phase === 'playing'
                    ? 'TARGET ACTIVE'
                    : 'ROUND FINISHED'}
              </div>
            </div>

            <div className="target-arena">
              <div className="target-arena-center" />

              <div className="target-arena-hint">
                {phase === 'playing'
                  ? 'CLICK THE TARGET'
                  : 'YOUR TARGET WILL APPEAR HERE'}
              </div>

              {phase === 'playing' && (
                <button
                  className="target-crosshair"
                  type="button"
                  onClick={hitTarget}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                  aria-label="Hit target"
                  title="Hit target"
                >
                  <span className="target-core" />
                </button>
              )}

              {phase === 'ready' && (
                <div className="target-ready">
                  <div className="target-overlay-icon">🎯</div>
                  <div className="target-overlay-title">TAKE YOUR SHOT</div>
                  <div className="target-overlay-copy">
                    Start when you're ready. The target will move around the
                    arena—click it before it changes position.
                  </div>
                </div>
              )}

              {phase === 'finished' && (
                <div className="target-finished">
                  <div className="target-overlay-icon">🏁</div>
                  <div className="target-overlay-title">TIME'S UP</div>
                  <div className="target-overlay-copy">
                    You hit {score} {score === 1 ? 'target' : 'targets'}.
                    {score >= best
                      ? ' New record—well played!'
                      : ' Give it another shot!'}
                  </div>
                </div>
              )}
            </div>

            <div className="target-feedback" role="status" aria-live="polite">
              <div className="target-feedback-title">{feedback}</div>
              <div className="target-feedback-copy">{feedbackCopy}</div>

              {backendSaveStatus !== 'idle' && (
                <div className="target-feedback-copy" aria-live="polite">
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
                className="target-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready' ? 'START GAME' : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="target-help">
            Every hit counts. The target changes position automatically, and
            hitting it moves it again immediately. Your best score is saved
            locally in this browser.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosTarget;