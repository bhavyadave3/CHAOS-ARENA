
import { useEffect, useRef, useState } from 'react';
import { saveGameScore } from '../../services/api';

const BEST_SCORE_KEY = 'chaos-arena-chaos-switch-best';

function getSavedBest() {
  try {
    const saved = Number(localStorage.getItem(BEST_SCORE_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : null;
  } catch {
    return null;
  }
}

const styles = `
  .cswitch-page {
    min-height: 100vh;
    padding: 28px;
    color: #f4f0ff;
    background:
      radial-gradient(ellipse at 50% 5%, rgba(139, 92, 246, .15), transparent 48%),
      #080711;
    font-family: 'DM Sans', sans-serif;
  }

  .cswitch-wrap {
    width: min(850px, 100%);
    margin: 0 auto;
  }

  .cswitch-back {
    padding: 10px 15px;
    border: 1px solid rgba(193, 165, 255, .2);
    border-radius: 10px;
    color: #c9b5ff;
    background: rgba(255, 255, 255, .035);
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }

  .cswitch-back:hover {
    background: rgba(167, 139, 250, .12);
    border-color: rgba(193, 165, 255, .5);
  }

  .cswitch-heading {
    margin: 34px 0 24px;
  }

  .cswitch-eyebrow {
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .cswitch-heading h1 {
    margin: 12px 0;
    font: 900 clamp(42px, 8vw, 72px)/.98 'Barlow Condensed', sans-serif;
    letter-spacing: 1px;
  }

  .cswitch-heading h1 span {
    color: #b49aff;
    text-shadow: 0 0 30px rgba(167, 139, 250, .2);
  }

  .cswitch-heading p {
    color: #a49bb9;
    font-size: 14px;
    line-height: 1.7;
  }

  .cswitch-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .cswitch-stat {
    padding: 18px;
    border: 1px solid rgba(193, 165, 255, .16);
    border-radius: 15px;
    background: rgba(255, 255, 255, .04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04);
  }

  .cswitch-stat-label {
    color: #9890ae;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1px;
  }

  .cswitch-stat-value {
    margin-top: 8px;
    color: #e7dcff;
    font: 700 32px 'Barlow Condensed', sans-serif;
  }

  .cswitch-arena {
    position: relative;
    overflow: hidden;
    padding: clamp(22px, 5vw, 42px);
    border: 1px solid rgba(193, 165, 255, .2);
    border-radius: 20px;
    background:
      radial-gradient(ellipse at top, rgba(139, 92, 246, .13), transparent 60%),
      rgba(20, 16, 34, .68);
    box-shadow:
      0 25px 70px rgba(0, 0, 0, .25),
      inset 0 1px 0 rgba(255, 255, 255, .05);
    text-align: center;
  }

  .cswitch-arena-label {
    color: #9389aa;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 2px;
  }

  .cswitch-target {
    width: 100%;
    min-height: 235px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 14px;
    margin: 22px 0;
    padding: 25px 15px;
    border: 1px solid rgba(193, 165, 255, .24);
    border-radius: 17px;
    color: #d5c5ff;
    background:
      radial-gradient(ellipse at center, rgba(167, 139, 250, .14), transparent 70%),
      rgba(255, 255, 255, .025);
    cursor: pointer;
    transition: border-color .2s, background .2s, box-shadow .2s, transform .15s;
  }

  .cswitch-target:focus-visible,
  .cswitch-start:focus-visible {
    outline: 2px solid #d0bbff;
    outline-offset: 4px;
  }

  .cswitch-target:active {
    transform: scale(.99);
  }

  .cswitch-target.waiting {
    color: #ff9aaa;
    border-color: rgba(255, 125, 142, .45);
    background: radial-gradient(ellipse at center, rgba(255, 75, 110, .13), transparent 72%);
    box-shadow: inset 0 0 35px rgba(255, 80, 110, .04);
  }

  .cswitch-target.go {
    color: #7af2bd;
    border-color: rgba(112, 242, 189, .8);
    background: radial-gradient(ellipse at center, rgba(62, 220, 154, .18), transparent 72%);
    box-shadow:
      0 0 35px rgba(62, 220, 154, .1),
      inset 0 0 35px rgba(62, 220, 154, .05);
    animation: cswitch-green-pulse .7s ease-in-out infinite alternate;
  }

  .cswitch-target.result {
    border-color: rgba(193, 165, 255, .3);
  }

  .cswitch-target-icon {
    font-size: 38px;
    line-height: 1;
  }

  .cswitch-target-main {
    font: 900 clamp(29px, 6vw, 46px)/1 'Barlow Condensed', sans-serif;
    letter-spacing: 1px;
  }

  .cswitch-target-sub {
    color: #aaa2bd;
    font-size: 12px;
    line-height: 1.6;
  }

  .cswitch-target.go .cswitch-target-sub {
    color: #a5f6d2;
  }

  .cswitch-feedback {
    min-height: 47px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin: 0 0 18px;
  }

  .cswitch-feedback-title {
    color: #e8ddff;
    font-size: 14px;
    font-weight: 700;
  }

  .cswitch-feedback-text {
    color: #a49bb9;
    font-size: 12px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .cswitch-save-status {
    margin-top: 5px;
    color: #70f2bd;
    font: 9px 'Space Mono', monospace;
    line-height: 1.6;
  }

  .cswitch-save-status.error {
    color: #ff9aaa;
  }

  .cswitch-start {
    width: 100%;
    padding: 15px 18px;
    border: 1px solid rgba(225, 210, 255, .65);
    border-radius: 11px;
    color: #160d27;
    background: linear-gradient(110deg, #d0bbff, #9873f0);
    font: 700 11px 'Space Mono', monospace;
    letter-spacing: 1px;
    cursor: pointer;
    box-shadow: 0 8px 26px rgba(139, 92, 246, .2);
    transition: transform .2s, filter .2s, box-shadow .2s;
  }

  .cswitch-start:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 12px 32px rgba(139, 92, 246, .32);
  }

  .cswitch-start:active {
    transform: scale(.99);
  }

  .cswitch-start:disabled {
    opacity: .65;
    cursor: wait;
  }

  .cswitch-help {
    margin-top: 18px;
    color: #89819f;
    font-size: 11px;
    line-height: 1.8;
    text-align: center;
  }

  @keyframes cswitch-green-pulse {
    from { box-shadow: 0 0 15px rgba(62, 220, 154, .07); }
    to { box-shadow: 0 0 38px rgba(62, 220, 154, .2); }
  }

  @media (max-width: 520px) {
    .cswitch-page { padding: 18px 14px; }
    .cswitch-heading { margin-top: 26px; }
    .cswitch-stats { gap: 9px; }
    .cswitch-stat { padding: 14px; }
    .cswitch-stat-value { font-size: 27px; }
    .cswitch-target { min-height: 205px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cswitch-target.go { animation: none; }
    .cswitch-target,
    .cswitch-start,
    .cswitch-back { transition: none; }
  }
`;

function ChaosSwitch({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [best, setBest] = useState(getSavedBest);
  const [reaction, setReaction] = useState(null);
  const [lastResult, setLastResult] = useState('');
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const timeoutRef = useRef(null);
  const signalTimeRef = useRef(0);
  const phaseRef = useRef('ready');
  const savingRef = useRef(false);

  useEffect(() => {
    return () => {
      phaseRef.current = 'finished';
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function startRound() {
    window.clearTimeout(timeoutRef.current);

    phaseRef.current = 'waiting';
    setPhase('waiting');
    setReaction(null);
    setLastResult('');
    setSaveStatus('');
    setSaveFailed(false);
    setSaving(false);
    savingRef.current = false;

    const delay = 1800 + Math.random() * 3200;

    timeoutRef.current = window.setTimeout(() => {
      if (phaseRef.current !== 'waiting') return;

      signalTimeRef.current = performance.now();
      phaseRef.current = 'go';
      setPhase('go');
    }, delay);
  }

  async function handleTargetClick() {
    if (phaseRef.current === 'ready' || phaseRef.current === 'result') {
      startRound();
      return;
    }

    if (phaseRef.current === 'waiting') {
      window.clearTimeout(timeoutRef.current);

      phaseRef.current = 'result';
      setPhase('result');
      setReaction(null);
      setRoundsPlayed((count) => count + 1);
      setLastResult('False start!');
      setSaveStatus('False starts are not submitted to the leaderboard.');
      setSaveFailed(false);
      return;
    }

    if (phaseRef.current !== 'go') return;

    const elapsed = Math.round(performance.now() - signalTimeRef.current);

    phaseRef.current = 'result';
    setPhase('result');
    setReaction(elapsed);
    setRoundsPlayed((count) => count + 1);

    if (best === null || elapsed < best) {
      setBest(elapsed);
      setLastResult('New personal best!');
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(elapsed));
      } catch {
        // Local score saving is optional.
      }
    } else if (elapsed < 250) {
      setLastResult('Lightning fast!');
    } else if (elapsed < 400) {
      setLastResult('Great reaction!');
    } else if (elapsed < 600) {
      setLastResult('Nice try. Can you go faster?');
    } else {
      setLastResult('A little slow. Give it another go!');
    }

    // The leaderboard ranks higher points first.
    // Faster reactions earn more points.
    const reactionPoints = Math.max(1, 1000 - elapsed);

    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setSaveStatus('Saving your result to the leaderboard...');
    setSaveFailed(false);

    try {
      await saveGameScore({
        gameName: 'Chaos Switch',
        score: reactionPoints,
        durationSeconds: Math.round(elapsed / 1000),
      });

      setSaveStatus(
        `Score saved to leaderboard: ${reactionPoints} reaction points.`
      );
    } catch (error) {
      setSaveFailed(true);
      setSaveStatus(
        error.message || 'Could not save the result. Check that the backend is running.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function getTargetContent() {
    if (phase === 'ready') {
      return {
        icon: '⚡',
        main: 'READY?',
        sub: 'Start a round when you are ready.',
      };
    }

    if (phase === 'waiting') {
      return {
        icon: '🔴',
        main: 'WAIT...',
        sub: 'Keep your hands off. Click only when it turns green.',
      };
    }

    if (phase === 'go') {
      return {
        icon: '🟢',
        main: 'CLICK NOW!',
        sub: 'Tap the button as quickly as you can!',
      };
    }

    if (reaction !== null) {
      return {
        icon: '⏱️',
        main: `${reaction} ms`,
        sub: 'That is your reaction time for this round.',
      };
    }

    return {
      icon: '✋',
      main: 'TOO SOON!',
      sub: 'You clicked before the green signal. Try again.',
    };
  }

  const target = getTargetContent();

  return (
    <>
      <style>{styles}</style>

      <main className="cswitch-page">
        <div className="cswitch-wrap">
          {onBack && (
            <button
              className="cswitch-back"
              type="button"
              onClick={() => {
                window.clearTimeout(timeoutRef.current);
                phaseRef.current = 'finished';
                onBack();
              }}
            >
              ← Back to Arena
            </button>
          )}

          <header className="cswitch-heading">
            <div className="cswitch-eyebrow">CHAOS ARENA / GAME 01</div>
            <h1>
              CHAOS <span>SWITCH</span>
            </h1>
            <p>
              Test your reflexes. Wait for green, then click as fast as you
              can. Click too early and you will have to start again.
            </p>
          </header>

          <section className="cswitch-stats" aria-label="Your records">
            <div className="cswitch-stat">
              <div className="cswitch-stat-label">PERSONAL BEST</div>
              <div className="cswitch-stat-value">
                {best === null ? '—' : `${best} ms`}
              </div>
            </div>

            <div className="cswitch-stat">
              <div className="cswitch-stat-label">ROUNDS PLAYED</div>
              <div className="cswitch-stat-value">{roundsPlayed}</div>
            </div>
          </section>

          <section className="cswitch-arena">
            <div className="cswitch-arena-label">REACTION TEST</div>

            <button
              className={`cswitch-target ${phase}`}
              type="button"
              onClick={handleTargetClick}
              aria-label={
                phase === 'go'
                  ? 'Click now to record reaction time'
                  : phase === 'waiting'
                    ? 'Clicking now will count as a false start'
                    : 'Start a reaction round'
              }
            >
              <span className="cswitch-target-icon">{target.icon}</span>
              <span className="cswitch-target-main">{target.main}</span>
              <span className="cswitch-target-sub">{target.sub}</span>
            </button>

            <div className="cswitch-feedback" role="status" aria-live="polite">
              {lastResult && (
                <>
                  <div className="cswitch-feedback-title">{lastResult}</div>
                  {reaction !== null && (
                    <div className="cswitch-feedback-text">
                      Reaction time: {reaction} milliseconds.
                    </div>
                  )}
                </>
              )}

              {saveStatus && (
                <div
                  className={`cswitch-save-status ${saveFailed ? 'error' : ''}`}
                >
                  {saving ? '◌ ' : saveFailed ? '⚠ ' : '✓ '}
                  {saveStatus}
                </div>
              )}
            </div>

            {(phase === 'ready' || phase === 'result') && (
              <button
                className="cswitch-start"
                type="button"
                onClick={startRound}
                disabled={saving}
              >
                {phase === 'ready' ? 'START ROUND' : 'PLAY AGAIN'}
              </button>
            )}
          </section>

          <p className="cswitch-help">
            Wait for the red signal to turn green. Faster reactions earn more
            leaderboard points. Your personal best is saved in this browser.
          </p>
        </div>
      </main>
    </>
  );
}

export default ChaosSwitch;
