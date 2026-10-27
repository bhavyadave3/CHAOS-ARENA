import { useCallback, useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const GRID_SIZE = 5;
const TIME_LIMIT = 45;
const BEST_KEY = 'chaos-arena-chaos-floor-best';

const START_POSITION = { row: 4, col: 2 };
const EXIT_POSITION = { row: 0, col: 2 };

function createFloor() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
    status: 'safe',
  }));
}

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

const styles = `
  .cf-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .cf-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .cf-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
  }

  .cf-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .cf-heading {
    margin: 32px 0 22px;
  }

  .cf-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .cf-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .cf-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .cf-heading p {
    max-width: 610px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .cf-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .cf-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .cf-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .cf-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .cf-panel {
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

  .cf-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .cf-panel-title {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .cf-live {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #a9a1bf;
    font: 9px 'Space Mono', monospace;
  }

  .cf-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #70f2bd;
    box-shadow: 0 0 10px rgba(112,242,189,.6);
  }

  .cf-grid {
    width: min(100%, 440px);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: clamp(5px, 1.5vw, 10px);
  }

  .cf-tile {
    aspect-ratio: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 2px;
    color: #bab0d5;
    border: 1px solid rgba(193,165,255,.17);
    border-radius: 10px;
    background: rgba(255,255,255,.035);
    font: 700 clamp(15px, 3vw, 25px) 'DM Sans', sans-serif;
    cursor: pointer;
    transition:
      background .2s,
      border-color .2s,
      box-shadow .2s,
      transform .15s;
  }

  .cf-tile:focus-visible {
    outline: 2px solid #d0bbff;
    outline-offset: 2px;
  }

  .cf-tile.safe:hover {
    background: rgba(167,139,250,.1);
    border-color: rgba(193,165,255,.4);
    transform: translateY(-2px);
  }

  .cf-tile.safe {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.025);
  }

  .cf-tile.exit {
    color: #7af2bd;
    background: rgba(48,204,142,.09);
    border-color: rgba(112,242,189,.48);
  }

  .cf-tile.exit .cf-tile-caption {
    color: #7af2bd;
  }

  .cf-tile.player {
    color: #e5d7ff;
    background: linear-gradient(145deg, rgba(167,139,250,.3), rgba(123,91,202,.17));
    border-color: #b49aff;
    box-shadow:
      0 0 22px rgba(167,139,250,.19),
      inset 0 1px 0 rgba(255,255,255,.1);
  }

  .cf-tile.warning {
    color: #ff9ba8;
    background: rgba(255,77,105,.15);
    border-color: rgba(255,104,125,.8);
    animation: cf-warning .55s ease-in-out infinite alternate;
  }

  .cf-tile.gone {
    color: rgba(255,255,255,.15);
    background: rgba(3,3,10,.75);
    border-color: rgba(255,255,255,.045);
    box-shadow: inset 0 0 15px rgba(0,0,0,.35);
  }

  .cf-tile.gone:hover {
    border-color: rgba(255,125,142,.3);
  }

  .cf-tile:disabled {
    cursor: default;
  }

  .cf-tile-caption {
    color: #a9a0bf;
    font: 7px 'Space Mono', monospace;
    letter-spacing: .2px;
    text-align: center;
  }

  @keyframes cf-warning {
    from {
      box-shadow: 0 0 3px rgba(255,104,125,.1);
    }
    to {
      box-shadow: 0 0 17px rgba(255,104,125,.22);
    }
  }

  .cf-message {
    min-height: 54px;
    margin: 18px 0 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    text-align: center;
  }

  .cf-message-title {
    color: #e7dcff;
    font-size: 14px;
    font-weight: 700;
  }

  .cf-message-text {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .cf-controls {
    display: grid;
    grid-template-columns: repeat(3, 48px);
    justify-content: center;
    gap: 7px;
    margin: 14px auto 22px;
  }

  .cf-control {
    width: 48px;
    height: 42px;
    color: #d2c0ff;
    background: rgba(167,139,250,.08);
    border: 1px solid rgba(193,165,255,.22);
    border-radius: 9px;
    font-size: 19px;
    cursor: pointer;
    transition: background .2s, transform .15s;
  }

  .cf-control:hover:not(:disabled) {
    background: rgba(167,139,250,.18);
  }

  .cf-control:active:not(:disabled) {
    transform: scale(.95);
  }

  .cf-control:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .cf-control.empty {
    visibility: hidden;
  }

  .cf-action {
    display: block;
    width: 100%;
    padding: 14px 17px;
    color: #160d27;
    background: linear-gradient(110deg, #d0bbff, #9873f0);
    border: 1px solid rgba(225,210,255,.65);
    border-radius: 10px;
    font: 700 11px 'Space Mono', monospace;
    letter-spacing: .8px;
    cursor: pointer;
    box-shadow: 0 8px 26px rgba(139,92,246,.2);
    transition: transform .2s, filter .2s;
  }

  .cf-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  .cf-help {
    margin: 18px 0 0;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  .cf-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-top: 20px;
    color: #aaa2bd;
    font-size: 10px;
  }

  .cf-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .cf-legend i {
    width: 9px;
    height: 9px;
    border-radius: 3px;
    background: rgba(167,139,250,.5);
  }

  .cf-legend .cf-legend-warning {
    background: #ff788c;
  }

  .cf-legend .cf-legend-gone {
    background: #242131;
    border: 1px solid #544b69;
  }

  .cf-legend .cf-legend-exit {
    background: #70f2bd;
  }

  @media (max-width: 520px) {
    .cf-page { padding: 18px 12px; }
    .cf-heading { margin-top: 26px; }
    .cf-stats { gap: 7px; }
    .cf-stat { padding: 11px; }
    .cf-stat-label { font-size: 8px; letter-spacing: .2px; }
    .cf-tile { border-radius: 7px; }
    .cf-tile-caption { font-size: 6px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cf-tile,
    .cf-action,
    .cf-control { transition: none; }
    .cf-tile.warning { animation: none; }
  }
`;

function ChaosFloor({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [floor, setFloor] = useState(createFloor);
  const [player, setPlayer] = useState(START_POSITION);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(readBest);
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');
  const [message, setMessage] = useState(
    'Reach the green exit. Watch for tiles that begin to collapse.'
  );
  const [messageTitle, setMessageTitle] = useState('Find your way out');

  const phaseRef = useRef('ready');
  const floorRef = useRef(createFloor());
  const playerRef = useRef(START_POSITION);
  const elapsedRef = useRef(0);

  const collapseIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const collapseTimeoutsRef = useRef([]);

  const clearGameTimers = useCallback(() => {
    window.clearInterval(collapseIntervalRef.current);
    window.clearInterval(clockIntervalRef.current);

    collapseIntervalRef.current = null;
    clockIntervalRef.current = null;

    collapseTimeoutsRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    collapseTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      phaseRef.current = 'finished';
      clearGameTimers();
    };
  }, [clearGameTimers]);

  const startGame = useCallback(() => {
    clearGameTimers();

    const newFloor = createFloor();

    floorRef.current = newFloor;
    playerRef.current = START_POSITION;
    elapsedRef.current = 0;
    phaseRef.current = 'running';

    setFloor(newFloor);
    setPlayer(START_POSITION);
    setElapsed(0);
    setPhase('running');
    setBackendSaveStatus('idle');
    setMessageTitle('Get to the exit!');
    setMessage(
      'Move with the arrow keys, WASD, the on-screen controls, or adjacent tiles.'
    );

    // Collapse one random floor tile every 1.35 seconds.
    collapseIntervalRef.current = window.setInterval(() => {
      if (phaseRef.current !== 'running') return;

      const currentPlayer = playerRef.current;
      const currentFloor = floorRef.current;

      const candidates = currentFloor
        .map((tile, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;

          const occupiedByPlayer =
            row === currentPlayer.row && col === currentPlayer.col;

          const isExit =
            row === EXIT_POSITION.row && col === EXIT_POSITION.col;

          return tile.status === 'safe' && !occupiedByPlayer && !isExit
            ? index
            : null;
        })
        .filter((index) => index !== null);

      if (candidates.length === 0) return;

      const targetIndex =
        candidates[Math.floor(Math.random() * candidates.length)];

      const warningFloor = currentFloor.map((tile, index) =>
        index === targetIndex ? { status: 'warning' } : tile
      );

      floorRef.current = warningFloor;
      setFloor(warningFloor);

      setMessageTitle('Floor collapsing!');
      setMessage('The flashing tile is about to disappear. Keep moving.');

      const collapseTimeout = window.setTimeout(() => {
        if (phaseRef.current !== 'running') return;

        const latestFloor = floorRef.current;

        const collapsedFloor = latestFloor.map((tile, index) =>
          index === targetIndex ? { status: 'gone' } : tile
        );

        floorRef.current = collapsedFloor;
        setFloor(collapsedFloor);
      }, 700);

      collapseTimeoutsRef.current.push(collapseTimeout);
    }, 1350);

    // The player has 45 seconds to reach the exit.
    clockIntervalRef.current = window.setInterval(() => {
      if (phaseRef.current !== 'running') return;

      const nextElapsed = elapsedRef.current + 1;
      elapsedRef.current = nextElapsed;
      setElapsed(nextElapsed);

      if (nextElapsed >= TIME_LIMIT) {
        phaseRef.current = 'lost';
        setPhase('lost');
        setMessageTitle('Time is up!');
        setMessage(
          'The arena closed. Start another round and find a faster route.'
        );
        clearGameTimers();
      }
    }, 1000);
  }, [clearGameTimers]);

  const moveTo = useCallback(
    (row, col) => {
      if (phaseRef.current !== 'running') return;

      if (
        row < 0 ||
        row >= GRID_SIZE ||
        col < 0 ||
        col >= GRID_SIZE
      ) {
        return;
      }

      const currentPlayer = playerRef.current;
      const distance =
        Math.abs(row - currentPlayer.row) +
        Math.abs(col - currentPlayer.col);

      if (distance !== 1) {
        setMessageTitle('One step at a time');
        setMessage('You can only move to a tile directly next to you.');
        return;
      }

      const index = row * GRID_SIZE + col;
      const destination = floorRef.current[index];

      if (destination.status === 'warning') {
        setMessageTitle('That tile is collapsing!');
        setMessage('Choose another safe tile before it disappears.');
        return;
      }

      if (destination.status === 'gone') {
        phaseRef.current = 'lost';
        setPhase('lost');
        setMessageTitle('You fell through!');
        setMessage(
          'That section of the floor is gone. Start a new round and avoid the gaps.'
        );
        clearGameTimers();
        return;
      }

      const nextPlayer = { row, col };

      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

      if (row === EXIT_POSITION.row && col === EXIT_POSITION.col) {
        phaseRef.current = 'won';
        setPhase('won');
        setMessageTitle('You made it!');
        setMessage(`You reached the exit in ${elapsedRef.current} seconds.`);
        clearGameTimers();

        // Update the local personal best.
        try {
          const previousBest = Number(localStorage.getItem(BEST_KEY));
          const hasPreviousBest =
            Number.isFinite(previousBest) && previousBest > 0;

          if (!hasPreviousBest || elapsedRef.current < previousBest) {
            localStorage.setItem(BEST_KEY, String(elapsedRef.current));
            setBest(elapsedRef.current);
          }
        } catch {
          // Keep the game playable if browser storage is unavailable.
        }

        // A faster escape earns more leaderboard points.
        const completionTime = elapsedRef.current;
        const leaderboardScore = Math.max(1, TIME_LIMIT - completionTime);

        setBackendSaveStatus('saving');

        saveGameScore({
          gameName: 'Chaos Floor',
          score: leaderboardScore,
          durationSeconds: completionTime,
        })
          .then(() => {
            setBackendSaveStatus('saved');
          })
          .catch((error) => {
            console.error('Could not save Chaos Floor score:', error);
            setBackendSaveStatus('error');
          });
      } else {
        setMessageTitle('Keep moving');
        setMessage(
          'Find a safe route to the green exit before time runs out.'
        );
      }
    },
    [clearGameTimers]
  );

  useEffect(() => {
    if (phase !== 'running') return undefined;

    function handleKeyDown(event) {
      const moves = {
        ArrowUp: [-1, 0],
        w: [-1, 0],
        W: [-1, 0],
        ArrowDown: [1, 0],
        s: [1, 0],
        S: [1, 0],
        ArrowLeft: [0, -1],
        a: [0, -1],
        A: [0, -1],
        ArrowRight: [0, 1],
        d: [0, 1],
        D: [0, 1],
      };

      const movement = moves[event.key];

      if (!movement) return;

      event.preventDefault();

      const current = playerRef.current;
      moveTo(current.row + movement[0], current.col + movement[1]);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, moveTo]);

  function handleTileClick(row, col) {
    moveTo(row, col);
  }

  const running = phase === 'running';

  return (
    <>
      <style>{styles}</style>

      <main className="cf-page">
        <div className="cf-wrap">
          {onBack && (
            <button
              className="cf-back"
              type="button"
              onClick={() => {
                clearGameTimers();
                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="cf-heading">
            <div className="cf-eyebrow">CHAOS ARENA / GAME 02</div>
            <h1>
              CHAOS <span>FLOOR</span>
            </h1>
            <p>
              The floor is falling apart. Find a safe route to the exit before
              the clock runs out. One wrong step can end your run.
            </p>
          </header>

          <section className="cf-stats" aria-label="Game statistics">
            <div className="cf-stat">
              <div className="cf-stat-label">TIME LEFT</div>
              <div className="cf-stat-value">
                {Math.max(0, TIME_LIMIT - elapsed)}s
              </div>
            </div>

            <div className="cf-stat">
              <div className="cf-stat-label">PERSONAL BEST</div>
              <div className="cf-stat-value">
                {best === null ? '—' : `${best}s`}
              </div>
            </div>

            <div className="cf-stat">
              <div className="cf-stat-label">STATUS</div>
              <div
                className="cf-stat-value"
                style={{
                  color:
                    phase === 'won'
                      ? '#70f2bd'
                      : phase === 'lost'
                        ? '#ff899c'
                        : '#d7c5ff',
                  fontSize: 'clamp(17px, 3.5vw, 25px)',
                }}
              >
                {phase === 'ready'
                  ? 'READY'
                  : phase === 'running'
                    ? 'IN PLAY'
                    : phase === 'won'
                      ? 'ESCAPED'
                      : 'GAME OVER'}
              </div>
            </div>
          </section>

          <section className="cf-panel">
            <div className="cf-panel-top">
              <div className="cf-panel-title">FLOOR MAP</div>
              <div className="cf-live">
                <span className="cf-live-dot" />
                {running ? 'ARENA ACTIVE' : 'ARENA STANDBY'}
              </div>
            </div>

            <div className="cf-grid" aria-label="Floor tiles">
              {floor.map((tile, index) => {
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;

                const isPlayer =
                  player.row === row && player.col === col;

                const isExit =
                  EXIT_POSITION.row === row &&
                  EXIT_POSITION.col === col;

                let symbol = '';
                let caption = '';

                if (isPlayer) {
                  symbol = '♟';
                  caption = 'YOU';
                } else if (tile.status === 'gone') {
                  symbol = '×';
                  caption = 'GAP';
                } else if (tile.status === 'warning') {
                  symbol = '!';
                  caption = 'FALLING';
                } else if (isExit) {
                  symbol = '↟';
                  caption = 'EXIT';
                } else {
                  symbol = '◇';
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={`cf-tile ${tile.status} ${
                      isPlayer ? 'player' : ''
                    } ${isExit ? 'exit' : ''}`}
                    onClick={() => handleTileClick(row, col)}
                    disabled={!running}
                    aria-label={
                      isPlayer
                        ? `Your position, row ${row + 1}, column ${col + 1}`
                        : isExit
                          ? 'Exit tile'
                          : `${tile.status} tile, row ${row + 1}, column ${
                              col + 1
                            }`
                    }
                  >
                    <span>{symbol}</span>
                    {caption && (
                      <span className="cf-tile-caption">{caption}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="cf-message" role="status" aria-live="polite">
              <div className="cf-message-title">{messageTitle}</div>
              <div className="cf-message-text">{message}</div>

              {backendSaveStatus !== 'idle' && (
                <div className="cf-message-text" aria-live="polite">
                  {backendSaveStatus === 'saving'
                    ? 'Saving your score to the leaderboard…'
                    : backendSaveStatus === 'saved'
                      ? 'Score saved to the leaderboard!'
                      : 'Could not save score. Check that the backend is running.'}
                </div>
              )}
            </div>

            {running && (
              <div className="cf-controls" aria-label="Movement controls">
                <button
                  className="cf-control empty"
                  tabIndex={-1}
                  aria-hidden="true"
                  type="button"
                />

                <button
                  className="cf-control"
                  type="button"
                  aria-label="Move up"
                  onClick={() => moveTo(player.row - 1, player.col)}
                >
                  ↑
                </button>

                <button
                  className="cf-control empty"
                  tabIndex={-1}
                  aria-hidden="true"
                  type="button"
                />

                <button
                  className="cf-control"
                  type="button"
                  aria-label="Move left"
                  onClick={() => moveTo(player.row, player.col - 1)}
                >
                  ←
                </button>

                <button
                  className="cf-control"
                  type="button"
                  aria-label="Move down"
                  onClick={() => moveTo(player.row + 1, player.col)}
                >
                  ↓
                </button>

                <button
                  className="cf-control"
                  type="button"
                  aria-label="Move right"
                  onClick={() => moveTo(player.row, player.col + 1)}
                >
                  →
                </button>
              </div>
            )}

            {!running && (
              <button
                className="cf-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready'
                  ? 'START GAME'
                  : phase === 'won'
                    ? 'PLAY AGAIN'
                    : 'TRY AGAIN'}
              </button>
            )}

            <div className="cf-legend">
              <span><i /> Safe tile</span>
              <span><i className="cf-legend-warning" /> Falling</span>
              <span><i className="cf-legend-gone" /> Gap</span>
              <span><i className="cf-legend-exit" /> Exit</span>
            </div>
          </section>

          <p className="cf-help">
            Controls: Arrow keys or WASD. You can also use the on-screen
            arrows or click an adjacent tile. Reach the green exit at the
            top before 45 seconds are up.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosFloor;