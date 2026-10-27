import { useCallback, useEffect, useRef, useState } from 'react';
import {
  checkBackendHealth,
  getLeaderboard,
} from './services/api';
import { getRandomChaosEvent } from './data/chaosEvents';

import ChaosSwitch from './games/ChaosSwitch/ChaosSwitch';
import ChaosFloor from './games/ChaosFloor/ChaosFloor';
import ChaosFreeze from './games/ChaosFreeze/ChaosFreeze';
import ChaosMind from './games/ChaosMind/ChaosMind';
import ChaosStack from './games/ChaosStack/ChaosStack';
import ChaosTarget from './games/ChaosTarget/ChaosTarget';
import ChaosColors from './games/ChaosColors/ChaosColors';
import ChaosGravity from './games/ChaosGravity/ChaosGravity';
import ChaosMode from './games/ChaosMode/ChaosMode';

import './styles/global.css';

const games = [
  {
    id: 1,
    name: 'Chaos Switch',
    icon: '⚡',
    type: 'REACTION',
    description: 'React fast when the rules change.',
    color: 'purple',
  },
  {
    id: 2,
    name: 'Chaos Floor',
    icon: '🟪',
    type: 'SURVIVAL',
    description: 'Stay safe as the floor disappears.',
    color: 'blue',
  },
  {
    id: 3,
    name: 'Chaos Freeze',
    icon: '❄️',
    type: 'REFLEX',
    description: 'Move at the right time. Freeze when told.',
    color: 'cyan',
  },
  {
    id: 4,
    name: 'Chaos Mind',
    icon: '🧠',
    type: 'MEMORY',
    description: 'Remember the pattern and beat your score.',
    color: 'pink',
  },
  {
    id: 5,
    name: 'Chaos Stack',
    icon: '🧱',
    type: 'TIMING',
    description: 'Stack moving blocks without missing.',
    color: 'orange',
  },
  {
    id: 6,
    name: 'Chaos Target',
    icon: '🎯',
    type: 'ACCURACY',
    description: 'Hit each target before it disappears.',
    color: 'red',
  },
  {
    id: 7,
    name: 'Chaos Colors',
    icon: '🎨',
    type: 'FOCUS',
    description: 'Pick the correct color and ignore the rest.',
    color: 'green',
  },
  {
    id: 8,
    name: 'Chaos Gravity',
    icon: '🪐',
    type: 'PLATFORMER',
    description: 'Flip gravity to avoid the obstacles.',
    color: 'blue',
  },
  {
    id: 9,
    name: 'Chaos Mode',
    icon: '☠️',
    type: 'CHALLENGE',
    description: 'Take on a mix of unpredictable challenges.',
    color: 'purple',
  },
];

const panelStyles = `
  .feature-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 0 45px;
    color: #f4f0ff;
  }

  .feature-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 26px;
  }

  .feature-eyebrow {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #b49aff;
    font: 10px 'Space Mono', monospace;
    letter-spacing: 1.8px;
  }

  .feature-eyebrow span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #b49aff;
    box-shadow: 0 0 12px rgba(180,154,255,.6);
  }

  .feature-heading h1 {
    margin: 13px 0 10px;
    font: 900 clamp(35px, 5vw, 55px)/1 'Barlow Condensed', sans-serif;
  }

  .feature-heading h1 span {
    color: #b49aff;
  }

  .feature-description {
    max-width: 620px;
    margin: 0;
    color: #a49bb9;
    font-size: 13px;
    line-height: 1.8;
  }

  .feature-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: #e8ddff;
    background: rgba(167,139,250,.09);
    border: 1px solid rgba(193,165,255,.25);
    border-radius: 10px;
    font: 10px 'Space Mono', monospace;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }

  .feature-button:hover:not(:disabled) {
    background: rgba(167,139,250,.17);
    border-color: rgba(193,165,255,.5);
  }

  .feature-button:disabled {
    opacity: .55;
    cursor: wait;
  }

  .feature-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
    margin-bottom: 24px;
  }

  .feature-summary-card {
    padding: 19px;
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(193,165,255,.15);
    border-radius: 14px;
    backdrop-filter: blur(16px);
  }

  .feature-summary-label {
    color: #9690ae;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .feature-summary-value {
    margin-top: 10px;
    color: #e7dcff;
    font: 700 clamp(25px, 4vw, 34px) 'Barlow Condensed', sans-serif;
  }

  .feature-card {
    padding: 22px;
    border: 1px solid rgba(193,165,255,.17);
    border-radius: 16px;
    background:
      radial-gradient(ellipse at top left, rgba(139,92,246,.09), transparent 60%),
      rgba(20,16,34,.66);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
  }

  .feature-card h2 {
    margin: 0 0 8px;
    color: #e8ddff;
    font: 700 21px 'Barlow Condensed', sans-serif;
  }

  .feature-muted {
    color: #a49bb9;
    font-size: 12px;
    line-height: 1.8;
  }

  .feature-empty,
  .feature-error,
  .feature-loading {
    padding: 38px 20px;
    text-align: center;
    border: 1px dashed rgba(193,165,255,.22);
    border-radius: 13px;
    color: #a49bb9;
    font-size: 12px;
    line-height: 1.8;
  }

  .feature-empty-icon {
    margin-bottom: 12px;
    font-size: 31px;
  }

  .feature-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .feature-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 12px;
  }

  .feature-table th {
    padding: 13px 12px;
    color: #9289aa;
    border-bottom: 1px solid rgba(193,165,255,.17);
    font: 9px 'Space Mono', monospace;
    letter-spacing: .6px;
    white-space: nowrap;
  }

  .feature-table td {
    padding: 15px 12px;
    color: #d8ceeb;
    border-bottom: 1px solid rgba(193,165,255,.08);
    white-space: nowrap;
  }

  .feature-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .feature-table tbody tr:hover {
    background: rgba(167,139,250,.045);
  }

  .feature-rank {
    color: #b49aff;
    font: 700 15px 'Barlow Condensed', sans-serif;
  }

  .feature-score {
    color: #8df3c4;
    font: 700 17px 'Barlow Condensed', sans-serif;
  }

  .feature-game {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .feature-game-icon {
    display: grid;
    place-items: center;
    width: 33px;
    height: 33px;
    flex-shrink: 0;
    border: 1px solid rgba(193,165,255,.17);
    border-radius: 9px;
    background: rgba(167,139,250,.08);
    font-size: 17px;
  }

  .feature-achievement-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
  }

  .feature-achievement {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    min-width: 0;
    padding: 20px;
    border: 1px solid rgba(193,165,255,.16);
    border-radius: 15px;
    background: rgba(255,255,255,.025);
  }

  .feature-achievement.unlocked {
    background:
      radial-gradient(ellipse at top left, rgba(112,242,189,.07), transparent 75%),
      rgba(255,255,255,.025);
    border-color: rgba(112,242,189,.28);
  }

  .feature-achievement-icon {
    display: grid;
    place-items: center;
    width: 47px;
    height: 47px;
    flex-shrink: 0;
    border: 1px solid rgba(193,165,255,.2);
    border-radius: 13px;
    background: rgba(167,139,250,.1);
    font-size: 23px;
    filter: grayscale(1);
    opacity: .5;
  }

  .feature-achievement.unlocked .feature-achievement-icon {
    filter: none;
    opacity: 1;
    border-color: rgba(112,242,189,.3);
    background: rgba(112,242,189,.08);
  }

  .feature-achievement-content {
    flex: 1;
    min-width: 0;
  }

  .feature-achievement-title {
    margin: 1px 0 6px;
    color: #e7dcff;
    font: 700 18px 'Barlow Condensed', sans-serif;
  }

  .feature-achievement-description {
    color: #a49bb9;
    font-size: 11px;
    line-height: 1.7;
  }

  .feature-achievement-status {
    display: inline-block;
    margin-top: 11px;
    color: #9188a8;
    font: 9px 'Space Mono', monospace;
    letter-spacing: .7px;
  }

  .feature-achievement.unlocked .feature-achievement-status {
    color: #7af2bd;
  }

  .feature-notice {
    margin-top: 20px;
    color: #9086a7;
    font-size: 11px;
    line-height: 1.8;
  }

  @media (max-width: 720px) {
    .feature-page {
      padding-top: 22px;
    }

    .feature-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .feature-achievement-grid {
      grid-template-columns: 1fr;
    }

    .feature-card {
      padding: 15px;
    }

    .feature-table th,
    .feature-table td {
      padding: 12px 9px;
    }
  }

  @media (max-width: 420px) {
    .feature-summary {
      grid-template-columns: 1fr;
    }
  }
`;

function getLeaderboardRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.leaderboard)) {
    return payload.leaderboard;
  }

  if (Array.isArray(payload?.data?.leaderboard)) {
    return payload.data.leaderboard;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data?.results)) {
    return payload.data.results;
  }

  return [];
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getPlayerName(entry) {
  return (
    entry.username ||
    entry.player_name ||
    entry.user_name ||
    entry.player ||
    (entry.user_id ? `Player ${entry.user_id}` : 'Anonymous Player')
  );
}

function App() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [chaosCount, setChaosCount] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Track which main screen is currently open.
  const [activePanel, setActivePanel] = useState('dashboard');

  // Store leaderboard results fetched from Flask.
  const [scoresByGame, setScoresByGame] = useState({});
  const [scoresLoading, setScoresLoading] = useState(false);
  const [scoresError, setScoresError] = useState('');

  const searchInputRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const eventTimerRef = useRef(null);
  const lastEventRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function updateBackendStatus() {
      try {
        const result = await checkBackendHealth();

        if (!mounted) return;

        const connected =
          result?.success === true &&
          result?.status === 'online' &&
          result?.database === 'connected';

        setBackendStatus(connected ? 'online' : 'offline');
      } catch {
        if (mounted) setBackendStatus('offline');
      }
    }

    updateBackendStatus();

    const intervalId = window.setInterval(updateBackendStatus, 15000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  // Load the top scores for all nine games.
  const loadScores = useCallback(async () => {
    setScoresLoading(true);
    setScoresError('');

    try {
      const results = await Promise.all(
        games.map(async (game) => {
          const response = await getLeaderboard({
            gameName: game.name,
            limit: 10,
          });

          const rows = getLeaderboardRows(response).map((entry) => ({
            ...entry,
            game_name: game.name,
            score: Number(entry.score) || 0,
          }));

          return [game.name, rows];
        })
      );

      setScoresByGame(Object.fromEntries(results));
    } catch (error) {
      console.error('Could not load leaderboard:', error);
      setScoresError(
        error?.message ||
          'Could not load leaderboard scores. Check the backend connection.'
      );
    } finally {
      setScoresLoading(false);
    }
  }, []);

  // Fetch scores when either section is opened.
  useEffect(() => {
    if (
      activePanel !== 'leaderboard' &&
      activePanel !== 'achievements'
    ) {
      return undefined;
    }

    loadScores();
    return undefined;
  }, [activePanel, loadScores]);

  useEffect(() => {
    function handleKeyboardShortcuts(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        setActivePanel('dashboard');

        window.setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }

      if (event.key === 'Escape') {
        setSelectedGame(null);
        setActiveEvent(null);
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcuts);

    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
      window.clearTimeout(cooldownTimerRef.current);
      window.clearTimeout(eventTimerRef.current);
    };
  }, []);

  function unleashChaos() {
    if (cooldown) return;

    let event = getRandomChaosEvent();
    let attempts = 0;

    while (
      lastEventRef.current &&
      event.id === lastEventRef.current.id &&
      event.text === lastEventRef.current.text &&
      attempts < 20
    ) {
      event = getRandomChaosEvent();
      attempts += 1;
    }

    lastEventRef.current = event;

    setActiveEvent(event);
    setChaosCount((count) => count + 1);
    setCooldown(true);

    window.clearTimeout(cooldownTimerRef.current);
    window.clearTimeout(eventTimerRef.current);

    cooldownTimerRef.current = window.setTimeout(() => {
      setCooldown(false);
    }, 1800);

    eventTimerRef.current = window.setTimeout(() => {
      setActiveEvent(null);
    }, 5000);
  }

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const backendLabel = {
    checking: 'CHECKING BACKEND...',
    online: 'BACKEND CONNECTED',
    offline: 'BACKEND OFFLINE',
  }[backendStatus];

  const backendDotStyle = {
    backgroundColor:
      backendStatus === 'online'
        ? '#67f3bb'
        : backendStatus === 'offline'
          ? '#ff7d8e'
          : '#f5c46c',
    boxShadow:
      backendStatus === 'online'
        ? '0 0 12px rgba(103, 243, 187, 0.7)'
        : backendStatus === 'offline'
          ? '0 0 12px rgba(255, 125, 142, 0.6)'
          : '0 0 12px rgba(245, 196, 108, 0.5)',
  };

  // Preserve the individual game screens.
  if (selectedGame?.id === 1) {
    return <ChaosSwitch onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 2) {
    return <ChaosFloor onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 3) {
    return <ChaosFreeze onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 4) {
    return <ChaosMind onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 5) {
    return <ChaosStack onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 6) {
    return <ChaosTarget onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 7) {
    return <ChaosColors onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 8) {
    return <ChaosGravity onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame?.id === 9) {
    return <ChaosMode onBack={() => setSelectedGame(null)} />;
  }

  const allScoreRows = games.flatMap((game) =>
    (scoresByGame[game.name] || []).map((entry) => ({
      ...entry,
      game_name: game.name,
    }))
  );

  const leaderboardRows = [...allScoreRows]
    .sort((a, b) => {
      const scoreDifference = Number(b.score) - Number(a.score);

      if (scoreDifference !== 0) return scoreDifference;

      return String(b.created_at || '').localeCompare(
        String(a.created_at || '')
      );
    })
    .slice(0, 10);

  const gamesRepresented = new Set(
    allScoreRows.map((entry) => entry.game_name)
  );

  const highestScore = allScoreRows.reduce(
    (highest, entry) => Math.max(highest, Number(entry.score) || 0),
    0
  );

  // These achievements are calculated from the leaderboard data
  // currently available from the backend.
  const achievements = [
    {
      id: 'first-score',
      icon: '🏁',
      title: 'First Footprint',
      description: 'Get your first score recorded in the arena.',
      unlocked: allScoreRows.length > 0,
    },
    {
      id: 'variety-player',
      icon: '🎮',
      title: 'Variety Player',
      description: 'Have scores recorded across at least three different games.',
      unlocked: gamesRepresented.size >= 3,
    },
    {
      id: 'full-arena',
      icon: '👑',
      title: 'Full Arena',
      description: 'Record scores in all nine Chaos Arena games.',
      unlocked: gamesRepresented.size === games.length,
    },
    {
      id: 'double-digits',
      icon: '🔥',
      title: 'Double Digits',
      description: 'Get a score of 10 or higher in a game.',
      unlocked: highestScore >= 10,
    },
  ];

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  function openPanel(panel) {
    setActivePanel(panel);
    setSelectedGame(null);
  }

  return (
    <>
      <style>{panelStyles}</style>

      <div
        className={`app-shell${
          activeEvent
            ? ` chaos-active chaos-${activeEvent.effect}`
            : ''
        }`}
        id="home"
        data-chaos-effect={activeEvent?.effect || ''}
      >
        <aside className="sidebar">
          <a
            className="brand"
            href="#home"
            aria-label="Chaos Arena home"
            onClick={(event) => {
              event.preventDefault();
              openPanel('dashboard');
            }}
          >
            <span className="brand-symbol">C</span>
            <span>
              CHAOS<span className="brand-light">ARENA</span>
            </span>
          </a>

          <div className="sidebar-label">NAVIGATION</div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            <a
              className={`nav-item ${
                activePanel === 'dashboard' ? 'active' : ''
              }`}
              href="#home"
              onClick={(event) => {
                event.preventDefault();
                openPanel('dashboard');
              }}
            >
              <span>▦</span> Dashboard
            </a>

            <a
              className="nav-item"
              href="#games"
              onClick={(event) => {
                event.preventDefault();
                openPanel('dashboard');

                window.setTimeout(() => {
                  document.getElementById('games')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }, 0);
              }}
            >
              <span>◈</span> All Games
              <span className="nav-count">09</span>
            </a>

            <a
              className="nav-item"
              href="#chaos"
              onClick={(event) => {
                event.preventDefault();
                openPanel('dashboard');

                window.setTimeout(() => {
                  document.getElementById('chaos')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }, 0);
              }}
            >
              <span>⚡</span> Random Event
            </a>

            <a
              className={`nav-item ${
                activePanel === 'achievements' ? 'active' : ''
              }`}
              href="#achievements"
              onClick={(event) => {
                event.preventDefault();
                openPanel('achievements');
              }}
            >
              <span>♜</span> Achievements
            </a>

            <a
              className={`nav-item ${
                activePanel === 'leaderboard' ? 'active' : ''
              }`}
              href="#leaderboard"
              onClick={(event) => {
                event.preventDefault();
                openPanel('leaderboard');
              }}
            >
              <span>♛</span> Leaderboard
            </a>
          </nav>

          <div className="sidebar-bottom">
            <div className="status-dot" />
            <div>
              <div className="online-text">INTERFACE READY</div>
              <div className="version-text">CHAOS ARENA · V1.0</div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div className="breadcrumb">
              HOME <span>/</span>{' '}
              {activePanel === 'dashboard'
                ? 'DASHBOARD'
                : activePanel === 'leaderboard'
                  ? 'LEADERBOARD'
                  : 'ACHIEVEMENTS'}
            </div>

            <div className="topbar-right">
              <span
                className="live-indicator"
                role="status"
                aria-live="polite"
                title="Flask backend and database connection"
              >
                <span style={backendDotStyle} />
                {backendLabel}
              </span>

              <div className="avatar" aria-label="Player profile">
                P
              </div>
            </div>
          </header>

          {activePanel === 'dashboard' && (
            <>
              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <span /> YOUR GAME SPACE
                  </div>

                  <h1>
                    READY TO <span>PLAY?</span>
                  </h1>

                  <p className="welcome-copy">
                    Pick a game below, or roll for a random event.
                  </p>
                </div>

                <div className="hero-mark" aria-hidden="true">
                  <div className="hero-ring ring-one" />
                  <div className="hero-ring ring-two" />
                  <div className="hero-core">
                    C<span>!</span>
                  </div>
                </div>
              </section>

              <section
                className="stats-grid"
                aria-label="Game statistics"
              >
                <div className="stat-card">
                  <div className="stat-icon purple-icon">◈</div>
                  <div>
                    <div className="stat-label">GAMES AVAILABLE</div>
                    <div className="stat-number">
                      {String(games.length).padStart(2, '0')}{' '}
                      <span>GAMES</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue-icon">⚡</div>
                  <div>
                    <div className="stat-label">EVENTS TRIGGERED</div>
                    <div className="stat-number">
                      {String(chaosCount).padStart(2, '0')}{' '}
                      <span>TOTAL</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green-icon">◉</div>
                  <div>
                    <div className="stat-label">BACKEND STATUS</div>

                    <div
                      className="stat-number status-number"
                      style={{
                        color:
                          backendStatus === 'online'
                            ? '#7af2bd'
                            : backendStatus === 'offline'
                              ? '#ff8a9b'
                              : '#f5c46c',
                        fontSize: 'clamp(15px, 1.5vw, 22px)',
                      }}
                    >
                      {backendStatus === 'checking'
                        ? 'CHECKING'
                        : backendStatus === 'online'
                          ? 'CONNECTED'
                          : 'OFFLINE'}
                    </div>
                  </div>
                </div>
              </section>

              <section className="chaos-panel" id="chaos">
                <div className="chaos-panel-content">
                  <div className="chaos-label">
                    <span /> RANDOM EVENT
                  </div>

                  <h2>
                    CAN'T DECIDE? <span>LET'S ROLL.</span>
                  </h2>

                  <p>
                    One click, one surprise. See what you get this time.
                  </p>

                  <button
                    className={`chaos-button ${
                      cooldown ? 'button-cooldown' : ''
                    }`}
                    onClick={unleashChaos}
                    disabled={cooldown}
                    type="button"
                  >
                    <span className="button-icon">⚡</span>
                    {cooldown ? 'ROLLING...' : 'ROLL THE DICE'}
                    <span className="button-arrow">↗</span>
                  </button>

                  <div className="cooldown-note">
                    ONE RANDOM EVENT AT A TIME
                  </div>
                </div>

                <div className="chaos-visual" aria-hidden="true">
                  <div className="visual-orbit orbit-a" />
                  <div className="visual-orbit orbit-b" />
                  <div className="visual-diamond">✳</div>
                  <span className="visual-spark spark-a">✦</span>
                  <span className="visual-spark spark-b">✧</span>
                  <span className="visual-spark spark-c">+</span>
                </div>
              </section>

              {activeEvent && (
                <div
                  key={`${chaosCount}-${activeEvent.id}-${activeEvent.text}`}
                  className={`event-toast ${activeEvent.className}`}
                  role="status"
                  aria-live="polite"
                >
                  <div className="event-icon">{activeEvent.icon}</div>

                  <div className="event-copy">
                    <div className="event-tag">
                      {activeEvent.title} · #{chaosCount}
                    </div>
                    <h3>{activeEvent.title}</h3>
                    <p>{activeEvent.text}</p>
                  </div>

                  <button
                    className="event-close"
                    onClick={() => setActiveEvent(null)}
                    aria-label="Close event"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              )}

              <section className="games-section" id="games">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">
                      <span /> FIND SOMETHING TO PLAY
                    </div>

                    <h2>
                      PICK A <span>GAME</span>
                    </h2>
                  </div>

                  <label className="search-box">
                    <span aria-hidden="true">⌕</span>

                    <input
                      ref={searchInputRef}
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search games..."
                      aria-label="Search games"
                    />

                    <kbd>Ctrl K</kbd>
                  </label>
                </div>

                <div className="games-grid">
                  {filteredGames.map((game) => (
                    <button
                      className={`game-card ${game.color}`}
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      type="button"
                      aria-label={`Open ${game.name}`}
                    >
                      <div className="game-card-top">
                        <span className="game-number">
                          {String(game.id).padStart(2, '0')}
                        </span>
                        <span className="game-type">{game.type}</span>
                      </div>

                      <div className="game-art">
                        <div className="art-circle">{game.icon}</div>
                        <span className="art-cross cross-one">+</span>
                        <span className="art-cross cross-two">✦</span>
                      </div>

                      <div className="game-info">
                        <h3>{game.name}</h3>
                        <p>{game.description}</p>
                        <div className="play-link">
                          PLAY GAME <span>↗</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredGames.length === 0 && (
                  <p className="empty-state">
                    No games match that search. Try another name.
                  </p>
                )}
              </section>

              <footer className="footer">
                <span>CHAOS ARENA · 2026</span>
                <span>
                  BUILT FOR THE NEXT ROUND{' '}
                  <span className="footer-star">✳</span>
                </span>
              </footer>
            </>
          )}

          {activePanel === 'leaderboard' && (
            <section className="feature-page" id="leaderboard">
              <div className="feature-heading">
                <div>
                  <div className="feature-eyebrow">
                    <span /> THE ARENA RECORDS
                  </div>

                  <h1>
                    CHAOS <span>LEADERBOARD</span>
                  </h1>

                  <p className="feature-description">
                    The highest scores returned by the arena database,
                    ranked from highest to lowest across all nine games.
                  </p>
                </div>

                <button
                  className="feature-button"
                  type="button"
                  onClick={loadScores}
                  disabled={scoresLoading}
                >
                  ↻ {scoresLoading ? 'LOADING...' : 'REFRESH SCORES'}
                </button>
              </div>

              <div className="feature-summary">
                <div className="feature-summary-card">
                  <div className="feature-summary-label">
                    SCORES LOADED
                  </div>
                  <div className="feature-summary-value">
                    {scoresLoading ? '—' : allScoreRows.length}
                  </div>
                </div>

                <div className="feature-summary-card">
                  <div className="feature-summary-label">
                    GAMES WITH SCORES
                  </div>
                  <div className="feature-summary-value">
                    {scoresLoading
                      ? '—'
                      : `${gamesRepresented.size}/${games.length}`}
                  </div>
                </div>

                <div className="feature-summary-card">
                  <div className="feature-summary-label">
                    TOP SCORE FOUND
                  </div>
                  <div className="feature-summary-value">
                    {scoresLoading ? '—' : highestScore}
                  </div>
                </div>
              </div>

              <div className="feature-card">
                <h2>Top 10 Scores</h2>
                <p className="feature-muted">
                  Scores are retrieved from Flask, not invented or generated
                  by the dashboard.
                </p>

                {scoresLoading ? (
                  <div className="feature-loading">
                    Connecting to the arena database…
                  </div>
                ) : scoresError ? (
                  <div className="feature-error">
                    <div className="feature-empty-icon">⚠️</div>
                    <strong>Could not load the leaderboard.</strong>
                    <p>{scoresError}</p>
                    <button
                      className="feature-button"
                      type="button"
                      onClick={loadScores}
                    >
                      TRY AGAIN
                    </button>
                  </div>
                ) : leaderboardRows.length === 0 ? (
                  <div className="feature-empty">
                    <div className="feature-empty-icon">♛</div>
                    <strong>No scores are available yet.</strong>
                    <p>
                      Play one of the games and finish a round. Once a score
                      has been saved to the backend, it can appear here.
                    </p>
                  </div>
                ) : (
                  <div className="feature-table-wrap">
                    <table className="feature-table">
                      <thead>
                        <tr>
                          <th>RANK</th>
                          <th>PLAYER</th>
                          <th>GAME</th>
                          <th>SCORE</th>
                          <th>DATE</th>
                        </tr>
                      </thead>

                      <tbody>
                        {leaderboardRows.map((entry, index) => {
                          const game = games.find(
                            (item) => item.name === entry.game_name
                          );

                          return (
                            <tr
                              key={
                                entry.id ??
                                `${entry.game_name}-${entry.user_id ?? 'anonymous'}-${entry.created_at ?? index}-${index}`
                              }
                            >
                              <td>
                                <span className="feature-rank">
                                  #{index + 1}
                                </span>
                              </td>

                              <td>{getPlayerName(entry)}</td>

                              <td>
                                <span className="feature-game">
                                  <span className="feature-game-icon">
                                    {game?.icon || '🎮'}
                                  </span>
                                  {entry.game_name}
                                </span>
                              </td>

                              <td>
                                <span className="feature-score">
                                  {Number(entry.score) || 0}
                                </span>
                              </td>

                              <td>{formatDate(entry.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="feature-notice">
                Rankings are based on the scores returned by each game's
                leaderboard endpoint. The same player may appear more than
                once if they have multiple score records.
              </p>
            </section>
          )}

          {activePanel === 'achievements' && (
            <section className="feature-page" id="achievements">
              <div className="feature-heading">
                <div>
                  <div className="feature-eyebrow">
                    <span /> YOUR ARENA MILESTONES
                  </div>

                  <h1>
                    CHAOS <span>ACHIEVEMENTS</span>
                  </h1>

                  <p className="feature-description">
                    Every run counts. Complete milestones by recording scores
                    and exploring the games in Chaos Arena.
                  </p>
                </div>

                <button
                  className="feature-button"
                  type="button"
                  onClick={loadScores}
                  disabled={scoresLoading}
                >
                  ↻ {scoresLoading ? 'CHECKING...' : 'UPDATE PROGRESS'}
                </button>
              </div>

              <div className="feature-summary">
                <div className="feature-summary-card">
                  <div className="feature-summary-label">
                    ACHIEVEMENTS UNLOCKED
                  </div>
                  <div className="feature-summary-value">
                    {scoresLoading
                      ? '—'
                      : `${unlockedAchievements}/${achievements.length}`}
                  </div>
                </div>

                <div className="feature-summary-card">
                  <div className="feature-summary-label">
                    GAMES EXPLORED
                  </div>
                  <div className="feature-summary-value">
                    {scoresLoading
                      ? '—'
                      : `${gamesRepresented.size}/${games.length}`}
                  </div>
                </div>

                <div className="feature-summary-card">
                  <div className="feature-summary-label">
                    HIGHEST SCORE FOUND
                  </div>
                  <div className="feature-summary-value">
                    {scoresLoading ? '—' : highestScore}
                  </div>
                </div>
              </div>

              {scoresLoading ? (
                <div className="feature-loading">
                  Checking your available score records…
                </div>
              ) : scoresError ? (
                <div className="feature-error">
                  <div className="feature-empty-icon">⚠️</div>
                  <strong>Achievement progress could not be loaded.</strong>
                  <p>{scoresError}</p>
                  <button
                    className="feature-button"
                    type="button"
                    onClick={loadScores}
                  >
                    TRY AGAIN
                  </button>
                </div>
              ) : (
                <div className="feature-achievement-grid">
                  {achievements.map((achievement) => (
                    <article
                      key={achievement.id}
                      className={`feature-achievement ${
                        achievement.unlocked ? 'unlocked' : ''
                      }`}
                    >
                      <div className="feature-achievement-icon">
                        {achievement.icon}
                      </div>

                      <div className="feature-achievement-content">
                        <h2 className="feature-achievement-title">
                          {achievement.title}
                        </h2>

                        <p className="feature-achievement-description">
                          {achievement.description}
                        </p>

                        <span className="feature-achievement-status">
                          {achievement.unlocked
                            ? '✓ UNLOCKED'
                            : '○ NOT UNLOCKED'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <p className="feature-notice">
                These milestones are calculated from the leaderboard records
                currently returned by your backend. They are not yet stored
                individually in the database as player-specific achievements.
              </p>
            </section>
          )}
        </main>

        {selectedGame && (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedGame(null)}
            role="presentation"
          >
            <div
              className="game-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedGame(null)}
                aria-label="Close game details"
                type="button"
              >
                ×
              </button>

              <div className="modal-icon">{selectedGame.icon}</div>

              <div className="eyebrow">
                <span /> GAME {String(selectedGame.id).padStart(2, '0')}
              </div>

              <h2 id="game-modal-title">{selectedGame.name}</h2>
              <p>{selectedGame.description}</p>

              <div className="modal-notice">
                THIS GAME IS NOT PLAYABLE YET
              </div>

              <button
                className="modal-button"
                onClick={() => setSelectedGame(null)}
                type="button"
              >
                BACK TO GAMES
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;