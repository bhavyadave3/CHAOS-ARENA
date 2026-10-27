import { useCallback, useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const BEST_KEY = 'chaos-arena-chaos-stack-best';
const INITIAL_WIDTH = 56;
const INITIAL_X = 22;
const BASE_HEIGHT = 23;
const VISIBLE_LAYERS = 12;

const blockColors = [
  '#a78bfa',
  '#819aff',
  '#70d9e8',
  '#ff91c8',
  '#ffb478',
  '#70f2bd',
];

const styles = `
  .stack-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .stack-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .stack-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
  }

  .stack-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .stack-heading {
    margin: 32px 0 23px;
  }

  .stack-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .stack-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .stack-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .stack-heading p {
    max-width: 610px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .stack-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 17px;
  }

  .stack-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .stack-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .stack-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .stack-panel {
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

  .stack-panel-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .stack-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .stack-live {
    color: #a9a1bf;
    font: 9px 'Space Mono', monospace;
  }

  .stack-board {
    position: relative;
    width: 100%;
    height: 330px;
    overflow: hidden;
    border: 1px solid rgba(193,165,255,.13);
    border-radius: 13px;
    background:
      repeating-linear-gradient(
        0deg,
        transparent 0 22px,
        rgba(193,165,255,.035) 22px 23px
      ),
      radial-gradient(ellipse at 50% 75%, rgba(139,92,246,.12), transparent 64%),
      rgba(4,3,12,.4);
  }

  .stack-board::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      rgba(167,139,250,.04) 1px,
      transparent 1px
    );
    background-size: 10% 100%;
  }

  .stack-block {
    position: absolute;
    height: 19px;
    border: 1px solid rgba(255,255,255,.45);
    border-radius: 4px;
    background: var(--block-color);
    box-shadow:
      0 0 13px color-mix(in srgb, var(--block-color) 28%, transparent),
      inset 0 1px 0 rgba(255,255,255,.38),
      inset 0 -3px 0 rgba(0,0,0,.12);
    transition: width .12s ease, left .12s ease;
    pointer-events: none;
  }

  .stack-block.base {
    height: 22px;
    border-radius: 5px;
  }

  .stack-block.moving {
    border-color: rgba(255,255,255,.85);
    filter: brightness(1.2);
    box-shadow:
      0 0 24px color-mix(in srgb, var(--block-color) 48%, transparent),
      inset 0 1px 0 rgba(255,255,255,.5);
  }

  .stack-center-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: rgba(193,165,255,.10);
    pointer-events: none;
  }

  .stack-board-message {
    position: absolute;
    top: 16px;
    left: 10px;
    right: 10px;
    color: #c8b9e9;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
    text-align: center;
    pointer-events: none;
  }

  .stack-feedback {
    min-height: 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin: 15px 0 8px;
    text-align: center;
  }

  .stack-feedback-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .stack-feedback-text {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .stack-action {
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

  .stack-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .stack-action:active {
    transform: scale(.99);
  }

  .stack-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .stack-page { padding: 18px 12px; }
    .stack-heading { margin-top: 26px; }
    .stack-stats { gap: 7px; }
    .stack-stat { padding: 11px; }
    .stack-stat-label { font-size: 8px; letter-spacing: .2px; }
    .stack-board { height: 290px; }
    .stack-block { height: 17px; }
    .stack-block.base { height: 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .stack-action,
    .stack-block { transition: none; }
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

function ChaosStack({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [blocks, setBlocks] = useState([
    { x: INITIAL_X, width: INITIAL_WIDTH },
  ]);
  const [movingX, setMovingX] = useState(0);
  const [movingWidth, setMovingWidth] = useState(INITIAL_WIDTH);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [speed, setSpeed] = useState(27);
  const [feedback, setFeedback] = useState('Ready to stack?');
  const [feedbackDetail, setFeedbackDetail] = useState(
    'Stop the moving block when it lines up with the block below.'
  );
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const xRef = useRef(0);
  const directionRef = useRef(1);
  const animationFrameRef = useRef(null);
  const dropBlockRef = useRef(null);
  const startedAtRef = useRef(null);

  const visibleBlocks = blocks.slice(-VISIBLE_LAYERS);
  const currentColor = blockColors[score % blockColors.length];

  const startGame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const initialBlocks = [
      { x: INITIAL_X, width: INITIAL_WIDTH },
    ];

    xRef.current = 0;
    directionRef.current = 1;
    startedAtRef.current = Date.now();

    setBlocks(initialBlocks);
    setMovingX(0);
    setMovingWidth(INITIAL_WIDTH);
    setScore(0);
    setSpeed(27);
    setBackendSaveStatus('idle');
    setFeedback('Line it up!');
    setFeedbackDetail(
      'Click DROP BLOCK or press Space when the blocks overlap.'
    );
    setPhase('playing');
  }, []);

  const dropBlock = useCallback(() => {
    if (phase !== 'playing') return;

    const base = blocks[blocks.length - 1];
    const currentX = xRef.current;

    const overlapLeft = Math.max(base.x, currentX);
    const overlapRight = Math.min(
      base.x + base.width,
      currentX + movingWidth
    );

    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      setPhase('finished');
      setFeedback('Missed it!');
      setFeedbackDetail(
        `Your tower reached ${score} ${
          score === 1 ? 'block' : 'blocks'
        }. Try again and watch the alignment.`
      );

      // Submit the final score when the player misses.
      const durationSeconds = startedAtRef.current
        ? Math.max(
            0,
            Math.round((Date.now() - startedAtRef.current) / 1000)
          )
        : 0;

      setBackendSaveStatus('saving');

      saveGameScore({
        gameName: 'Chaos Stack',
        score,
        durationSeconds,
      })
        .then(() => {
          setBackendSaveStatus('saved');
        })
        .catch((error) => {
          console.error('Could not save Chaos Stack score:', error);
          setBackendSaveStatus('error');
        });

      return;
    }

    const perfect = overlapWidth >= base.width * 0.92;

    const newBlocks = [
      ...blocks,
      {
        x: overlapLeft,
        width: overlapWidth,
      },
    ];

    const nextScore = score + 1;

    setBlocks(newBlocks);
    setScore(nextScore);
    setMovingWidth(overlapWidth);

    xRef.current = 0;
    directionRef.current = 1;
    setMovingX(0);

    // Increase the movement speed as the tower grows.
    setSpeed(Math.min(68, 27 + nextScore * 2.4));

    if (nextScore > best) {
      setBest(nextScore);

      try {
        localStorage.setItem(BEST_KEY, String(nextScore));
      } catch {
        // The current run continues if browser storage is unavailable.
      }
    }

    if (perfect) {
      setFeedback('Perfect stack!');
      setFeedbackDetail('Almost no overhang. Keep the streak going!');
    } else {
      setFeedback('Nice placement!');
      setFeedbackDetail(
        `Block ${nextScore} placed. The next block will move a little faster.`
      );
    }
  }, [phase, blocks, movingWidth, score, best]);

  useEffect(() => {
    dropBlockRef.current = dropBlock;
  }, [dropBlock]);

  // Animate the current block from side to side.
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    let lastTimestamp = null;

    function animate(timestamp) {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      const maxX = Math.max(0, 100 - movingWidth);

      let nextX =
        xRef.current + directionRef.current * speed * delta;

      if (nextX >= maxX) {
        nextX = maxX;
        directionRef.current = -1;
      } else if (nextX <= 0) {
        nextX = 0;
        directionRef.current = 1;
      }

      xRef.current = nextX;
      setMovingX(nextX);

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [phase, movingWidth, speed]);

  // Spacebar is an alternative to the drop button.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return;
      if (phase !== 'playing') return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))
      ) {
        return;
      }

      event.preventDefault();
      dropBlockRef.current?.();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const statusText =
    phase === 'ready'
      ? 'READY'
      : phase === 'playing'
        ? 'STACKING'
        : 'GAME OVER';

  return (
    <>
      <style>{styles}</style>

      <main className="stack-page">
        <div className="stack-wrap">
          {onBack && (
            <button
              className="stack-back"
              type="button"
              onClick={() => {
                if (animationFrameRef.current !== null) {
                  cancelAnimationFrame(animationFrameRef.current);
                  animationFrameRef.current = null;
                }

                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="stack-heading">
            <div className="stack-eyebrow">CHAOS ARENA / GAME 05</div>

            <h1>
              CHAOS <span>STACK</span>
            </h1>

            <p>
              Stack each moving block as neatly as you can. Every successful
              placement makes the next block faster. One complete miss ends
              the round.
            </p>
          </header>

          <section className="stack-stats" aria-label="Game statistics">
            <div className="stack-stat">
              <div className="stack-stat-label">BLOCKS PLACED</div>
              <div className="stack-stat-value">{score}</div>
            </div>

            <div className="stack-stat">
              <div className="stack-stat-label">PERSONAL BEST</div>
              <div className="stack-stat-value">{best}</div>
            </div>

            <div className="stack-stat">
              <div className="stack-stat-label">GAME STATUS</div>
              <div className="stack-stat-value">{statusText}</div>
            </div>
          </section>

          <section className="stack-panel">
            <div className="stack-panel-top">
              <div className="stack-panel-label">STACKING ARENA</div>
              <div className="stack-live">
                {phase === 'playing'
                  ? `SPEED ${Math.round(speed)}`
                  : 'READY'}
              </div>
            </div>

            <div
              className="stack-board"
              aria-label={`Stacking board. ${score} blocks placed.`}
            >
              <div className="stack-center-line" />

              <div className="stack-board-message">
                {phase === 'ready'
                  ? 'READY TO BUILD'
                  : phase === 'playing'
                    ? 'LINE UP YOUR NEXT BLOCK'
                    : 'ROUND FINISHED'}
              </div>

              {visibleBlocks.map((block, index) => {
                const colorIndex =
                  (blocks.length - visibleBlocks.length + index) %
                  blockColors.length;

                return (
                  <div
                    key={blocks.length - visibleBlocks.length + index}
                    className={`stack-block ${index === 0 ? 'base' : ''}`}
                    style={{
                      left: `${block.x}%`,
                      width: `${block.width}%`,
                      bottom: `${12 + index * BASE_HEIGHT}px`,
                      '--block-color': blockColors[colorIndex],
                    }}
                  />
                );
              })}

              {phase === 'playing' && (
                <div
                  className="stack-block moving"
                  style={{
                    left: `${movingX}%`,
                    width: `${movingWidth}%`,
                    bottom: `${12 + visibleBlocks.length * BASE_HEIGHT}px`,
                    '--block-color': currentColor,
                  }}
                />
              )}
            </div>

            <div className="stack-feedback" role="status" aria-live="polite">
              <div className="stack-feedback-title">{feedback}</div>
              <div className="stack-feedback-text">{feedbackDetail}</div>

              {backendSaveStatus !== 'idle' && (
                <div className="stack-feedback-text" aria-live="polite">
                  {backendSaveStatus === 'saving'
                    ? 'Saving your score to the leaderboard…'
                    : backendSaveStatus === 'saved'
                      ? 'Score saved to the leaderboard!'
                      : 'Could not save your score. Check that the backend is running.'}
                </div>
              )}
            </div>

            {phase === 'playing' ? (
              <button
                className="stack-action"
                type="button"
                onClick={() => dropBlockRef.current?.()}
              >
                DROP BLOCK
              </button>
            ) : (
              <button
                className="stack-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready' ? 'START GAME' : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="stack-help">
            Use the DROP BLOCK button or press Space. Aim for the block below:
            the more overlap you keep, the easier the next placement will be.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosStack;