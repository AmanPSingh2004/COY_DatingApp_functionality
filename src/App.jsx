
import { useState, useEffect, useRef } from 'react';
import './App.css';

const API = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const startX = useRef(null);

  async function loadFeed() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API}/feed`);
      if (!response.ok) throw new Error('Could not load profiles');

      setProfiles(await response.json());
    } catch {
      setError('Cannot connect to the server. Start your backend and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'Discover') loadFeed();
  }, [activeTab]);

  async function swipe(action) {
    const profile = profiles[0];
    if (!profile || busy) return;

    setBusy(true);
    setFeedback('');

    setSwipeOffset(action === 'like' ? 50 : -50);

    try {
      const response = await fetch(`${API}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Swipe failed');
      }

      // Remove the card after the animation.
      await new Promise((resolve) => setTimeout(resolve, 250));

      setProfiles((current) =>
        current.filter((item) => item.id !== profile.id)
      );

      setSwipeOffset(0);

      setFeedback(
        result.matched
          ? `It's a match with ${profile.name}! `
          : action === 'like'
            ? `You liked ${profile.name}`
            : `You passed on ${profile.name}`
      );
    } catch (err) {
      setSwipeOffset(0);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handlePointerDown(event) {
    if (busy) return;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (startX.current === null || busy) return;
    setSwipeOffset(event.clientX - startX.current);
  }

  function handlePointerUp() {
    if (startX.current === null || busy) return;

    const distance = swipeOffset;
    startX.current = null;

    if (distance > 50) {
      swipe('like');
    } else if (distance < -50) {
      swipe('pass');
    } else {
      setSwipeOffset(0);
    }
  }

  function Home() {
    return null;
  }

  function Discover() {
    const profile = profiles[0];
    console.log('Current profile:', profile);

    if (loading) return <p>Loading profiles...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
      <section className="discover">
        <h1>Discover</h1>
        <p className="subtitle">
          {profiles.length} profiles remaining
        </p>

        {feedback && <p className="feedback">{feedback}</p>}

        {!profile ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h2>You've seen everyone!</h2>
            <p>There are no more profiles to discover right now.</p>
            <button onClick={loadFeed}>Refresh feed</button>
          </div>
        ) : (
          <>
            <div className="swipe-area">
              <article
                className="swipe-card"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.04}deg)`,
                  transition: startX.current !== null
                    ? 'none'
                    : 'transform 0.25s ease',
                  touchAction: 'pan-y',
                }}
              >
                <img src={profile.photo} alt={profile.name} />

                <div className="card-details">
                  <h2>{profile.name}, {profile.age}</h2>
                  <p> {profile.city}</p>
                  <p>{profile.bio}</p>

                  <div className="interests">
                    {profile.interests?.map((interest) => (
                      <span key={interest}>{interest}</span>
                    ))}
                  </div>
                </div>

                {swipeOffset > 40 && (
                  <div className="swipe-label like-label">LIKE </div>
                )}

                {swipeOffset < -40 && (
                  <div className="swipe-label pass-label">PASS ✕</div>
                )}
              </article>
            </div>

            <div className="swipe-buttons">
              <button
                className="pass-button"
                onClick={() => swipe('pass')}
                disabled={busy}
                aria-label="Pass on profile"
              >
                not
              </button>

              <button
                className="like-button"
                onClick={() => swipe('like')}
                disabled={busy}
                aria-label="Like profile"
              >
                like
              </button>
            </div>

            <p className="swipe-hint">
              Drag right to like or left to pass
            </p>
          </>
        )}
      </section>
    );
  }


function Matches() {
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState('');

  async function loadMatches() {
    try {
      setLoadingMatches(true);
      setMatchesError('');

      const response = await fetch(`${API}/matches`);

      if (!response.ok) {
        throw new Error('Could not load matches');
      }

      const data = await response.json();
      setMatches(data);
    } catch {
      setMatchesError('Could not load matches. Check your backend.');
    } finally {
      setLoadingMatches(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  if (loadingMatches) {
    return <p>Loading matches...</p>;
  }

  if (matchesError) {
    return <p className="error">{matchesError}</p>;
  }

  return (
    <section className="matches">
      <h1>Your Matches </h1>
      <p className="subtitle">
        People who have liked you back.
      </p>

      {matches.length === 0 ? (
        <div className="matches-empty">
          <div className="empty-icon">No match</div>
          <h2>No matches yet</h2>
          <p>
            When you and another person like each other,
            your match will appear here.
          </p>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((profile) => (
            <article className="match-card" key={profile.id}>
              <img src={profile.photo} alt={profile.name} />

              <div className="match-details">
                <h2>{profile.name}, {profile.age}</h2>
                <p> {profile.city}</p>
                <p>{profile.bio}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


  return (
    <>
      <nav className="navbar">
  <button onClick={() => setActiveTab('Home')}>Home</button>
  <button onClick={() => setActiveTab('Discover')}>Discover</button>
  <button onClick={() => setActiveTab('Matches')}>Matches</button>
</nav>
      
<main className="page">
  {activeTab === 'Home' && <Home />}
  {activeTab === 'Discover' && <Discover />}
  {activeTab === 'Matches' && <Matches />}
</main>

    </>
  );
}
