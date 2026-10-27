import { useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const BEST_KEY = 'chaos-arena-chaos-mind-best';
const TILE_COUNT = 9;
const STARTING_LENGTH = 2;

const styles = `
  .mind-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139,92,246,.16), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .mind-wrap {
    width: min(780px, 100%);
    margin: 0 auto;
  }

  .mind-back {
    padding: 10px 15px;
    color: #c9b5ff;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 10px;
    cursor: pointer;
  }

  .mind-back:hover {
    background: rgba(167,139,250,.12);
    border-color: rgba(193,165,255,.5);
  }

  .mind-heading {
    margin: 32px 0 23px;
  }

  .mind-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .mind-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 70px)/.98 'Barlow Condensed', sans-serif;
  }

  .mind-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 28px rgba(167,139,250,.2);
  }

  .mind-heading p {
    max-width: 600px;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .mind-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 17px;
  }

  .mind-stat {
    padding: 16px;
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 13px;
    background: rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .mind-stat-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .mind-stat-value {
    margin-top: 9px;
    color: #e7dcff;
    font: 700 clamp(22px, 4vw, 30px) 'Barlow Condensed', sans-serif;
  }

  .mind-panel {
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

  .mind-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
  }

  .mind-panel-label {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.5px;
  }

  .mind-stage {
    padding: 20px;
    border: 1px solid rgba(193,165,255,.13);
    border-radius: 14px;
    background: rgba(255,255,255,.02);
    text-align: center;
  }

  .mind-stage-title {
    color: #e7dcff;
    font-size: 16px;
    font-weight: 700;
  }

  .mind-stage-copy {
    min-height: 36px;
    margin-top: 8px;
    color: #a49bb9;
    font-size: 12px;
    line-height: 1.7;
  }

  .mind-progress {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 13px;
  }

  .mind-progress-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(193,165,255,.18);
    transition: background .2s, box-shadow .2s;
  }

  .mind-progress-dot.done {
    background: #7af2bd;
    box-shadow: 0 0 10px rgba(112,242,189,.4);
  }

  .mind-progress-dot.current {
    background: #b49aff;
    box-shadow: 0 0 10px rgba(167,139,250,.5);
  }

  .mind-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(8px, 2vw, 14px);
    width: min(100%, 390px);
    margin: 24px auto;
  }

  .mind-tile {
    position: relative;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    min-width: 0;
    border: 1px solid rgba(193,165,255,.18);
    border-radius: 15px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.01)),
      rgba(167,139,250,.045);
    color: rgba(213,197,255,.35);
    font-size: clamp(24px, 6vw, 38px);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background .16s,
      border-color .16s,
      box-shadow .16s,
      transform .12s,
      color .16s;
  }

  .mind-tile:focus-visible {
    outline: 2px solid #d0bbff;
    outline-offset: 3px;
  }

  .mind-tile:disabled {
    cursor: default;
  }

  .mind-tile:not(:disabled):hover {
    border-color: rgba(193,165,255,.55);
    background: rgba(167,139,250,.12);
  }

  .mind-tile:active:not(:disabled) {
    transform: scale(.96);
  }

  .mind-tile.lit {
    color: #fff;
    border-color: rgba(213,193,255,.95);
    background: linear-gradient(145deg, #bca2ff, #8055df);
    box-shadow:
      0 0 30px rgba(167,139,250,.32),
      inset 0 1px 0 rgba(255,255,255,.45);
    transform: scale(.97);
  }

  .mind-tile.correct {
    color: #8bffcf;
    border-color: rgba(112,242,189,.75);
    background: rgba(62,220,154,.12);
  }

  .mind-tile.wrong {
    color: #ff9dac;
    border-color: rgba(255,125,142,.8);
    background: rgba(255,77,105,.15);
  }

  .mind-action {
    display: block;
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
    transition: transform .2s, filter .2s, box-shadow .2s;
  }

  .mind-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 12px 32px rgba(139,92,246,.3);
  }

  .mind-action:active {
    transform: scale(.99);
  }

  .mind-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.9;
    text-align: center;
  }

  @media (max-width: 520px) {
    .mind-page { padding: 18px 12px; }
    .mind-heading { margin-top: 26px; }
    .mind-stats { gap: 7px; }
    .mind-stat { padding: 11px; }
    .mind-stat-label { font-size: 8px; letter-spacing: .2px; }
    .mind-tile { border-radius: 10px; }
    .mind-stage { padding: 15px 10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .mind-tile,
    .mind-action,
    .mind-progress-dot {
      transition: none;
    }
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

function randomTile(previousTile = -1) {
  let next = Math.floor(Math.random() * TILE_COUNT);

  // Avoid repeating the same tile immediately where possible.
  if (TILE_COUNT > 1) {
    while (next === previousTile) {
      next = Math.floor(Math.random() * TILE_COUNT);
    }
  }

  return next;
}

function makeSequence(length) {
  const result = [];

  for (let i = 0; i < length; i += 1) {
    result.push(randomTile(result[i - 1] ?? -1));
  }

  return result;
}

function ChaosMind({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [sequence, setSequence] = useState([]);
  const [activeTile, setActiveTile] = useState(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [feedback, setFeedback] = useState('Ready to test your memory?');
  const [feedbackDetail, setFeedbackDetail] = useState(
    'Watch the glowing tiles, then repeat the pattern in the same order.'
  );
  const [lastClickedTile, setLastClickedTile] = useState(null);
  const [wrongTile, setWrongTile] = useState(null);
  const [backendSaveStatus, setBackendSaveStatus] = useState('idle');

  const playbackTimersRef = useRef([]);
  const feedbackTimerRef = useRef(null);
  const startedAtRef = useRef(null);

  function clearPlaybackTimers() {
    playbackTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    playbackTimersRef.current = [];
    window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
  }

  useEffect(() => {
    return () => {
      clearPlaybackTimers();
    };
  }, []);

  // Play the sequence once each time a round begins.
  useEffect(() => {
    if (phase !== 'showing' || sequence.length === 0) {
      return undefined;
    }

    const timers = [];
    let elapsed = 450;

    setActiveTile(null);
    setFeedback('Watch carefully...');
    setFeedbackDetail('Remember the order of the glowing tiles.');

    sequence.forEach((tileIndex) => {
      timers.push(
        window.setTimeout(() => {
          setActiveTile(tileIndex);
        }, elapsed)
      );

      elapsed += 440;

      timers.push(
        window.setTimeout(() => {
          setActiveTile(null);
        }, elapsed)
      );

      elapsed += 200;
    });

    timers.push(
      window.setTimeout(() => {
        setActiveTile(null);
        setInputIndex(0);
        setLastClickedTile(null);
        setWrongTile(null);
        setPhase('input');
        setFeedback('Your turn');
        setFeedbackDetail(
          `Repeat all ${sequence.length} tiles in the same order.`
        );
      }, elapsed + 150)
    );

    playbackTimersRef.current = timers;

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      playbackTimersRef.current = [];
    };
  }, [phase, sequence]);

  function startGame() {
    clearPlaybackTimers();

    const initialSequence = makeSequence(STARTING_LENGTH);

    startedAtRef.current = Date.now();

    setSequence(initialSequence);
    setRound(1);
    setScore(0);
    setInputIndex(0);
    setActiveTile(null);
    setLastClickedTile(null);
    setWrongTile(null);
    setBackendSaveStatus('idle');
    setFeedback('Watch carefully...');
    setFeedbackDetail('The first pattern is about to begin.');
    setPhase('showing');
  }

  function handleTileClick(tileIndex) {
    if (phase !== 'input') return;

    setActiveTile(tileIndex);
    setLastClickedTile(tileIndex);

    const expectedTile = sequence[inputIndex];

    if (tileIndex !== expectedTile) {
      setWrongTile(tileIndex);
      setPhase('finished');
      setActiveTile(null);
      setFeedback('Not quite!');
      setFeedbackDetail(
        `You reached round ${round}. You completed ${score} ${
          score === 1 ? 'round' : 'rounds'
        }.`
      );

      // Submit completed rounds to the Flask leaderboard.
      const durationSeconds = startedAtRef.current
        ? Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
        : 0;

      setBackendSaveStatus('saving');

      saveGameScore({
        gameName: 'Chaos Mind',
        score,
        durationSeconds,
      })
        .then(() => {
          setBackendSaveStatus('saved');
        })
        .catch((error) => {
          console.error('Could not save Chaos Mind score:', error);
          setBackendSaveStatus('error');
        });

      return;
    }

    setWrongTile(null);

    const nextInputIndex = inputIndex + 1;
    setInputIndex(nextInputIndex);

    if (nextInputIndex < sequence.length) {
      setFeedback('Good memory!');
      setFeedbackDetail(
        `${sequence.length - nextInputIndex} ${
          sequence.length - nextInputIndex === 1 ? 'tile' : 'tiles'
        } left in this pattern.`
      );

      feedbackTimerRef.current = window.setTimeout(() => {
        setActiveTile(null);
        setLastClickedTile(null);
      }, 180);

      return;
    }

    const completedRounds = score + 1;
    setScore(completedRounds);

    if (completedRounds > best) {
      setBest(completedRounds);

      try {
        localStorage.setItem(BEST_KEY, String(completedRounds));
      } catch {
        // The game remains playable if local storage is unavailable.
      }
    }

    setActiveTile(null);
    setLastClickedTile(null);
    setFeedback('Pattern complete!');
    setFeedbackDetail('Next round adds another tile. Get ready.');
    setPhase('between');

    const nextSequence = [
      ...sequence,
      randomTile(sequence[sequence.length - 1]),
    ];

    feedbackTimerRef.current = window.setTimeout(() => {
      setSequence(nextSequence);
      setRound((currentRound) => currentRound + 1);
      setInputIndex(0);
      setPhase('showing');
    }, 850);
  }

  const isPlaying =
    phase === 'showing' || phase === 'input' || phase === 'between';

  return (
    <>
      <style>{styles}</style>

      <main className="mind-page">
        <div className="mind-wrap">
          {onBack && (
            <button
              className="mind-back"
              type="button"
              onClick={() => {
                clearPlaybackTimers();
                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="mind-heading">
            <div className="mind-eyebrow">CHAOS ARENA / GAME 04</div>
            <h1>
              CHAOS <span>MIND</span>
            </h1>
            <p>
              Watch the tiles light up, then repeat the pattern. Each round
              adds another step. One wrong move ends your run.
            </p>
          </header>

          <section className="mind-stats" aria-label="Memory game statistics">
            <div className="mind-stat">
              <div className="mind-stat-label">ROUND</div>
              <div className="mind-stat-value">{round}</div>
            </div>

            <div className="mind-stat">
              <div className="mind-stat-label">ROUNDS CLEARED</div>
              <div className="mind-stat-value">{score}</div>
            </div>

            <div className="mind-stat">
              <div className="mind-stat-label">PERSONAL BEST</div>
              <div className="mind-stat-value">{best}</div>
            </div>
          </section>

          <section className="mind-panel">
            <div className="mind-panel-top">
              <div className="mind-panel-label">MEMORY GRID · 3 × 3</div>
              <div className="mind-panel-label">
                {phase === 'showing'
                  ? 'WATCH'
                  : phase === 'input'
                    ? 'REPEAT'
                    : phase === 'between'
                      ? 'NICE WORK'
                      : phase === 'finished'
                        ? 'GAME OVER'
                        : 'READY'}
              </div>
            </div>

            <div className="mind-stage" role="status" aria-live="polite">
              <div className="mind-stage-title">{feedback}</div>
              <div className="mind-stage-copy">{feedbackDetail}</div>

              {phase === 'input' && (
                <div
                  className="mind-progress"
                  aria-label={`Tile ${inputIndex} of ${sequence.length}`}
                >
                  {sequence.map((_, index) => (
                    <span
                      key={index}
                      className={`mind-progress-dot ${
                        index < inputIndex
                          ? 'done'
                          : index === inputIndex
                            ? 'current'
                            : ''
                      }`}
                    />
                  ))}
                </div>
              )}

              {backendSaveStatus !== 'idle' && (
                <div className="mind-stage-copy" aria-live="polite">
                  {backendSaveStatus === 'saving'
                    ? 'Saving your score to the leaderboard…'
                    : backendSaveStatus === 'saved'
                      ? 'Score saved to the leaderboard!'
                      : 'Could not save your score. Check that the backend is running.'}
                </div>
              )}
            </div>

            <div className="mind-grid">
              {Array.from({ length: TILE_COUNT }, (_, tileIndex) => {
                const isWrong = wrongTile === tileIndex;
                const isCorrectClick =
                  phase === 'input' &&
                  lastClickedTile === tileIndex &&
                  !isWrong;

                return (
                  <button
                    key={tileIndex}
                    type="button"
                    className={`mind-tile ${
                      activeTile === tileIndex ? 'lit' : ''
                    } ${isWrong ? 'wrong' : ''} ${
                      isCorrectClick ? 'correct' : ''
                    }`}
                    onClick={() => handleTileClick(tileIndex)}
                    disabled={phase !== 'input'}
                    aria-label={`Memory tile ${tileIndex + 1}`}
                  >
                    {activeTile === tileIndex
                      ? '✦'
                      : isWrong
                        ? '×'
                        : '◇'}
                  </button>
                );
              })}
            </div>

            {!isPlaying && (
              <button
                className="mind-action"
                type="button"
                onClick={startGame}
              >
                {phase === 'ready' ? 'START GAME' : 'TRY AGAIN'}
              </button>
            )}
          </section>

          <p className="mind-help">
            Tip: say the tile positions out loud while watching the pattern.
            Once playback ends, click the tiles in exactly the same order.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosMind;