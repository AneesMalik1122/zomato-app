import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import FeedNavigation from './FeedNavigation.jsx'
import { getReelId } from './reelStorage.js'
import './Home.css'

const getStoreId = (reel) => {
  const partner = reel.foodPartner ?? reel.foodPartnerId ?? reel.partner ?? reel.owner
  const partnerId = typeof partner === 'object' && partner !== null
    ? partner._id ?? partner.id
    : partner

  return partnerId ?? reel._id ?? reel.id
}

function Saved() {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState('')
  const [pendingReelId, setPendingReelId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadSavedReels = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get('http://localhost:5000/api/food/saved', {
          withCredentials: true,
          signal: controller.signal,
          timeout: 10000,
        })
        if (!Array.isArray(data.foodItems)) {
          throw new Error('Saved reels API did not return a foodItems list.')
        }
        setReels(data.foodItems)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error('Could not load saved reels:', requestError)
          setError(
            requestError.response?.data?.message
            || (requestError.response?.status === 401
              ? 'Please log in as a user to see your saved reels.'
              : requestError.code === 'ECONNABORTED'
                ? 'Loading saved reels timed out. Check the backend and try again.'
                : 'Could not connect to saved reels. Check the backend and try again.'),
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadSavedReels()
    return () => controller.abort()
  }, [retryCount])

  const removeSavedReel = async (reel) => {
    const reelId = getReelId(reel)
    if (!reelId || pendingReelId) return

    setPendingReelId(reelId)
    setError('')
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/food/save',
        { foodid: reelId },
        { withCredentials: true },
      )
      if (data.saved !== false) {
        throw new Error('The server did not confirm that the reel was removed from saved.')
      }
      setReels((current) => current.filter((item) => getReelId(item) !== reelId))
    } catch (requestError) {
      console.error('Could not remove saved reel:', requestError)
      setError(
        requestError.response?.data?.message
        || (requestError.response?.status === 401
          ? 'Please log in as a user to update saved reels.'
          : requestError instanceof Error
            ? requestError.message
            : 'Could not remove this reel. Please try again.'),
      )
    } finally {
      setPendingReelId(null)
    }
  }

  return (
    <main className="saved-page">
      <header className="saved-header">
        <h1>Saved reels</h1>
        <p>Your bookmarked food videos, all in one place.</p>
      </header>
      {error && <p className="feed-action-error saved-action-error" role="alert">{error}</p>}
      {loading ? (
        <section className="saved-empty" role="status" aria-live="polite">
          <span className="feed-spinner" aria-hidden="true" />
          <p>Loading saved reels...</p>
        </section>
      ) : error && reels.length === 0 ? (
        <section className="saved-empty">
          <span className="feed-feedback-icon" aria-hidden="true">!</span>
          <h2>Saved reels unavailable</h2>
          <p>{error}</p>
          <button
            className="feed-retry-button"
            type="button"
            onClick={() => setRetryCount((current) => current + 1)}
          >
            Try again
          </button>
        </section>
      ) : reels.length === 0 ? (
        <section className="saved-empty">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />
          </svg>
          <h2>No saved reels yet</h2>
          <p>Tap the bookmark on a reel to keep it here.</p>
        </section>
      ) : (
        <section className="saved-grid" aria-label="Saved food reels">
          {reels.map((reel, index) => {
            const reelId = getReelId(reel) ?? index
            return (
              <article className="saved-card" key={reelId}>
                {reel.video ? (
                  <video
                    className="saved-card-video"
                    src={reel.video}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    aria-label={reel.name ? `${reel.name} video` : 'Saved food video'}
                  />
                ) : (
                  <div className="saved-card-video saved-card-placeholder">Video unavailable</div>
                )}
                <div className="saved-card-content">
                  <h2>{reel.name || 'Food reel'}</h2>
                  <p>{reel.description || 'No description provided.'}</p>
                  <div className="saved-card-actions">
                    {getStoreId(reel) && (
                      <Link className="saved-store-link" to={`/store/${getStoreId(reel)}`}>
                        Visit store
                      </Link>
                    )}
                    <button
                      className="saved-remove-button"
                      type="button"
                      onClick={() => removeSavedReel(reel)}
                      disabled={pendingReelId === reelId}
                      aria-label={`Remove ${reel.name || 'reel'} from saved`}
                    >
                      {pendingReelId === reelId ? (
                        <span className="remove-loading">
                          <span className="action-spinner" aria-hidden="true" />
                          Removing...
                        </span>
                      ) : 'Remove'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
      <FeedNavigation />
    </main>
  )
}

export default Saved
