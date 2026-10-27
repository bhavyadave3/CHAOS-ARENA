import { useCallback, useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const GAME_DURATION = 30;
const STARTING_LIVES = 3;
const TRACK_COLUMNS = 6;
const BEST_KEY = 'chaos-arena-chaos-gravity-best';

const styles = `
  .gravity-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .gravity-wrap {
    width: min(900px, 100%);
    margin: 0 auto;
  }

  .gravity-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
  }

  .gravity-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .gravity-heading {
    margin: 32px 0 23px;
  }

  .gravity-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .gravity-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .gravity-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .gravity-heading p {
    max-width: 650px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .gravity-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 17px;
  }

  .gravity-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .gravity-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .gravity-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .gravity-panel {
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

  .gravity-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .gravity-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .gravity-status {
    color: #a9a1bf;
    font: 9px 'Space Mono', monospace;
  }

  .gravity-arena {
    position: relative;
    overflow: hidden;
    padding: 22px 14px;
    border: 1px solid rgba(193,165,255,.16);
    border-radius: 15px;
    background:
      radial-gradient(ellipse at 50% 50%, rgba(139,92,246,.11), transparent 70%),
      rgba(5,4,13,.55);
  }

  .gravity-arena::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      90deg,
      transparent 0 39px,
      rgba(193,165,255,.025) 40px
    );
  }

  .gravity-lane {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: clamp(4px, 1.3vw, 10px);
    align-items: center;
  }

  .gravity-lane + .gravity-lane {
    margin-top: 13px;
  }

  .gravity-lane-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 9px;
    color: #9289aa;
    font: 9px 'Space Mono', monospace;
    letter-spacing: 1px;
  }

  .gravity-lane-label.bottom-label {
    margin-top: 9px;
    margin-bottom: 0;
  }

  .gravity-cell {
    min-width: 0;
    height: clamp(44px, 8vw, 66px);
    display: grid;
    place-items: center;
    border: 1px solid rgba(193,165,255,.10);
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    color: rgba(193,165,255,.22);
    font-size: clamp(18px, 4vw, 26px);
    transition: background .18s, border-color .18s, box-shadow .18s;
  }

  .gravity-cell.player {
    color: #e8dcff;
    border-color: rgba(193,165,255,.66);
    background: linear-gradient(145deg, rgba(167,139,250,.28), rgba(123,91,202,.14));
    box-shadow:
      0 0 19px rgba(167,139,250,.16),
      inset 0 1px 0 rgba(255,255,255,.1);
  }

  .gravity-cell.hazard {
    color: #ff9eae;
    border-color: rgba(255,125,142,.65);
    background: rgba(255,77,105,.12);
    box-shadow: 0 0 17px rgba(255,77,105,.08);
  }

  .gravity-cell.player.hazard {
    border-color: #ff849a;
    background: rgba(255,77,105,.22);
    box-shadow: 0 0 23px rgba(255,77,105,.22);
  }

  .gravity-divider {
    height: 1px;
    margin: 20px 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(193,165,255,.25),
      transparent
    );
  }

  .gravity-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
    color: #c9b8ed;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1px;
    text-align: center;
  }

  .gravity-indicator strong {
    color: #d9caff;
  }

  .gravity-message {
    min-height: 54px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin: 15px 0 10px;
    text-align: center;
  }

  .gravity-message-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .gravity-message-copy {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .gravity-flip {
    width: 100%;
    padding: 16px 18px;
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

  .gravity-flip:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .gravity-flip:active:not(:disabled) {
    transform: scale(.99);
  }

  .gravity-flip:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .gravity-action {
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

  .gravity-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .gravity-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .gravity-page { padding: 18px 12px; }
    .gravity-heading { margin-top: 26px; }
    .gravity-stats { gap: 7px; }
    .gravity-stat { padding: 11px; }
    .gravity-stat-label { font-size: 8px; letter-spacing: .2px; }
    .gravity-arena { padding: 18px 7px; }
    .gravity-cell { border-radius: 6px; }
    .gravity-lane-label { font-size: 8px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .gravity-cell,
    .gravity-flip,
    .gravity-action { transition: none; }
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

function makeHazard(id) {
  return {
    id,
    lane: Math.random() < 0.5 ? 'top' : 'bottom',
    column: TRACK_COLUMNS - 1,
  };
}

function ChaosGravity({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [playerLane, setPlayerLane] = useState('bottom');
  const [hazard, setHazard] = useState(() => makeHazard(1));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState('Ready to flip gravity?');
  const [feedbackCopy, setFeedbackCopy] = useState(
    'Switch between the floor and ceiling to avoid incoming obstacles.'
  );
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const phaseRef = useRef('ready');
  const playerLaneRef = useRef('bottom');
  const hazardRef = useRef(hazard);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const timeRef = useRef(GAME_DURATION);

  const finishGame = useCallback((title, description) => {
    if (phaseRef.current !== 'playing') return;

    phaseRef.current = 'finished';
    setPhase('finished');
    setFeedback(title);
    setFeedbackCopy(description);

    const finalScore = scoreRef.current;
    const durationSeconds = Math.max(
      0,
      GAME_DURATION - timeRef.current
    );

    setBackendSaveStatus('saving');

    saveGameScore({
      gameName: 'Chaos Gravity',
      score: finalScore,
      durationSeconds,
    })
      .then(() => {
        setBackendSaveStatus('saved');
      })
      .catch((error) => {
        console.error('Could not save Chaos Gravity score:', error);
        setBackendSaveStatus('error');
      });
  }, []);

  const flipGravity = useCallback(() => {
    if (phaseRef.current !== 'playing') return;

    const nextLane =
      playerLaneRef.current === 'bottom' ? 'top' : 'bottom';

    playerLaneRef.current = nextLane;
    setPlayerLane(nextLane);
    setFeedback('Gravity flipped!');
    setFeedbackCopy(
      `You're now on the ${
        nextLane === 'top' ? 'ceiling' : 'floor'
      }. Watch the next obstacle.`
    );
  }, []);

  function startGame() {
    const firstHazard = makeHazard(1);

    phaseRef.current = 'playing';
    playerLaneRef.current = 'bottom';
    hazardRef.current = firstHazard;
    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;
    timeRef.current = GAME_DURATION;

    setPhase('playing');
    setPlayerLane('bottom');
    setHazard(firstHazard);
    setScore(0);
    setLives(STARTING_LIVES);
    setTimeLeft(GAME_DURATION);
    setBackendSaveStatus('idle');
    setFeedback('Stay alert!');
    setFeedbackCopy(
      'Each obstacle takes about three seconds to reach you. Flip before impact.'
    );
  }

  // Advance hazards and check collisions.
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const movementTimer = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return;

      const currentHazard = hazardRef.current;

      // Replace a hazard after it has passed the player.
      if (currentHazard.column === 0) {
        const nextHazard = makeHazard(currentHazard.id + 1);
        hazardRef.current = nextHazard;
        setHazard(nextHazard);
        return;
      }

      const nextColumn = currentHazard.column - 1;
      const nextHazard = {
        ...currentHazard,
        column: nextColumn,
      };

      hazardRef.current = nextHazard;
      setHazard(nextHazard);

      // Check collision when the hazard reaches the player's column.
      if (nextColumn === 0) {
        if (playerLaneRef.current === currentHazard.lane) {
          const remainingLives = livesRef.current - 1;

          livesRef.current = remainingLives;
          setLives(remainingLives);

          if (remainingLives <= 0) {
            finishGame(
              'Collision!',
              `You survived ${scoreRef.current} obstacles. Flip earlier next time.`
            );
          } else {
            setFeedback('Watch out!');
            setFeedbackCopy(
              `You were hit. ${remainingLives} ${
                remainingLives === 1 ? 'life remains' : 'lives remain'
              }. Flip before the next obstacle arrives.`
            );
          }
        } else {
          const nextScore = scoreRef.current + 1;

          scoreRef.current = nextScore;
          setScore(nextScore);
          setFeedback('Nice dodge!');
          setFeedbackCopy(
            `Obstacle avoided. ${nextScore} ${
              nextScore === 1 ? 'obstacle' : 'obstacles'
            } cleared.`
          );

          try {
            const storedBest = Number(localStorage.getItem(BEST_KEY));
            const currentBest =
              Number.isFinite(storedBest) && storedBest > 0
                ? storedBest
                : 0;

            if (nextScore > currentBest) {
              localStorage.setItem(BEST_KEY, String(nextScore));
              setBest(nextScore);
            }
          } catch {
            // The current game continues if local storage is unavailable.
          }
        }
      }
    }, 550);

    const clockTimer = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return;

      const nextTime = timeRef.current - 1;
      timeRef.current = nextTime;
      setTimeLeft(nextTime);

      if (nextTime <= 0) {
        finishGame(
          "Time's up!",
          `You avoided ${scoreRef.current} obstacles. Play again and beat your record.`
        );
      }
    }, 1000);

    return () => {
      window.clearInterval(movementTimer);
      window.clearInterval(clockTimer);
    };
  }, [phase, finishGame]);

  // Keyboard: Space, G, Arrow Up, or Arrow Down flips gravity.
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    function handleKeyDown(event) {
      const shouldFlip =
        event.code === 'Space' ||
        event.key.toLowerCase() === 'g' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown';

      if (!shouldFlip) return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }

      event.preventDefault();
      flipGravity();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, flipGravity]);

  const isPlaying = phase === 'playing';

  function renderLane(lane) {
    return (
      <div className="gravity-lane" key={lane}>
        {Array.from({ length: TRACK_COLUMNS }, (_, column) => {
          const isPlayer = playerLane === lane && column === 0;
          const isHazard =
            hazard.lane === lane && hazard.column === column;

          return (
            <div
              key={`${lane}-${column}`}
              className={`gravity-cell ${isPlayer ? 'player' : ''} ${
                isHazard ? 'hazard' : ''
              }`}
            >
              {isHazard ? '☄️' : isPlayer ? '🚀' : '·'}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <main className="gravity-page">
        <div className="gravity-wrap">
          {onBack && (
            <button
              className="gravity-back"
              type="button"
              onClick={() => {
                phaseRef.current = 'finished';
                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="gravity-heading">
            <div className="gravity-eyebrow">CHAOS ARENA / GAME 08</div>
            <h1>
              CHAOS <span>GRAVITY</span>
            </h1>
            <p>
              The arena has no fixed floor. Flip gravity to switch between the
              ceiling and the floor, then avoid incoming hazards. Survive for
              30 seconds and beat your personal best.
            </p>
          </header>

          <section className="gravity-stats" aria-label="Game statistics">
            <div className="gravity-stat">
              <div className="gravity-stat-label">OBSTACLES CLEARED</div>
              <div className="gravity-stat-value">{score}</div>
            </div>

            <div className="gravity-stat">
              <div className="gravity-stat-label">PERSONAL BEST</div>
              <div className="gravity-stat-value">{best}</div>
            </div>

            <div className="gravity-stat">
              <div className="gravity-stat-label">TIME LEFT</div>
              <div className="gravity-stat-value">{timeLeft}s</div>
            </div>
          </section>

          <section className="gravity-panel">
            <div className="gravity-panel-top">
              <div className="gravity-panel-label">GRAVITY ARENA</div>

              <div className="gravity-status">
                {phase === 'ready'
                  ? 'READY'
                  : isPlaying
                    ? 'IN PLAY'
                    : 'ROUND OVER'}
              </div>
            </div>

            <div className="gravity-arena">
              <div className="gravity-lane-label">
                <span>CEILING</span>
                <span>
                  {playerLane === 'top' ? 'YOU ARE HERE' : 'SAFE LANE'}
                </span>
              </div>

              {renderLane('top')}

              <div className="gravity-divider" />

              {renderLane('bottom')}

              <div className="gravity-lane-label bottom-label">
                <span>FLOOR</span>
                <span>
                  {playerLane === 'bottom' ? 'YOU ARE HERE' : 'SAFE LANE'}
                </span>
              </div>
            </div>

            <div className="gravity-indicator">
              CURRENT GRAVITY:
              <strong>
                {playerLane === 'top' ? '↑ CEILING' : '↓ FLOOR'}
              </strong>
              · LIVES: <strong>{'♥ '.repeat(lives).trim() || '0'}</strong>
            </div>

            <div className="gravity-message" role="status" aria-live="polite">
              <div className="gravity-message-title">{feedback}</div>
              <div className="gravity-message-copy">{feedbackCopy}</div>

              {backendSaveStatus !== 'idle' && (
                <div className="gravity-message-copy" aria-live="polite">
                  {backendSaveStatus === 'saving'
                    ? 'Saving your score to the leaderboard…'
                    : backendSaveStatus === 'saved'
                      ? 'Score saved to the leaderboard!'
                      : 'Could not save your score. Check that the backend is running.'}
                </div>
              )}
            </div>

            {isPlaying ? (
              <button
                className="gravity-flip"
                type="button"
                onClick={flipGravity}
              >
                ↕ FLIP GRAVITY
              </button>
            ) : (
              <button
                className="gravity-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready' ? 'START GAME' : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="gravity-help">
            Controls: click FLIP GRAVITY, press Space or G, or use the Up and
            Down arrow keys. Switch lanes before an obstacle reaches your
            position. Each avoided obstacle earns one point.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosGravity;