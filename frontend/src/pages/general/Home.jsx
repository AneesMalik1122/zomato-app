import { useEffect, useRef, useState } from 'react'
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

const getCount = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null)
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
  }
  if (value && typeof value === 'object') {
    return getCount(value.count, value.total, value.length)
  }
  return 0
}

const formatCount = (count) => new Intl.NumberFormat().format(count)

function Home() {
  const feedRef = useRef(null)
  const videoRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [reels, setReels] = useState([])
  const [likedReels, setLikedReels] = useState(() => new Set())
  const [savedReelIds, setSavedReelIds] = useState(() => new Set())
  const [pendingReelIds, setPendingReelIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [fetchError, setFetchError] = useState('')
  const [actionError, setActionError] = useState('')
  const [openCommentsId, setOpenCommentsId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchFoodReels = async () => {
      setLoading(true)
      setFetchError('')
      try {
        const response = await axios.get('http://localhost:5000/api/food/', {
          withCredentials: true,
          signal: controller.signal,
          timeout: 10000,
        })
        const data = response.data
        const foodItems = [
          data,
          data?.food,
          data?.foodItems,
          data?.foods,
          data?.reels,
          data?.data,
          data?.data?.food,
          data?.data?.foodItems,
          data?.data?.foods,
          data?.data?.reels,
        ].find(Array.isArray)

        if (!foodItems) {
          const responseKeys =
            data && typeof data === 'object' ? Object.keys(data).join(', ') : typeof data
          throw new Error(`Food API did not return a list. Response fields: ${responseKeys}`)
        }
        setReels(foodItems)
        setLikedReels(new Set(
          foodItems
            .filter((reel) => reel.likedByUser)
            .map((reel, index) => getReelId(reel) ?? index),
        ))
        setSavedReelIds(new Set(
          foodItems
            .filter((reel) => reel.savedByUser)
            .map((reel, index) => getReelId(reel) ?? index),
        ))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching food reels:', error)
          if (error.response) {
            setFetchError(error.response.data?.message
              || `Food API returned an error (${error.response.status}). Please try again.`)
          } else if (error.message.startsWith('Food API did not return a list.')) {
            setFetchError(error.message)
          } else if (error.code === 'ECONNABORTED') {
            setFetchError('The request took too long. Check that the backend is running, then try again.')
          } else {
            setFetchError('Could not connect to the food API. Check that the backend is running, then try again.')
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchFoodReels()
    return () => controller.abort()
  }, [retryCount])

  const handleScroll = () => {
    if (!feedRef.current) return
    const index = Math.round(feedRef.current.scrollTop / feedRef.current.clientHeight)
    if (index !== activeIndex) setActiveIndex(index)
  }

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return
      if (index === activeIndex) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [activeIndex, reels])

  const updatePendingReels = (reelId, pending) => {
    setPendingReelIds((current) => {
      const updated = new Set(current)
      if (pending) updated.add(reelId)
      else updated.delete(reelId)
      return updated
    })
  }

  const handleReaction = async (reel, type) => {
    const reelId = getReelId(reel)
    if (!reelId || pendingReelIds.has(reelId)) return
    updatePendingReels(reelId, true)
    setActionError('')
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/food/${type}`,
        { foodid: reelId },
        { withCredentials: true },
      )
      const isLiked = type === 'like'
      const active = isLiked ? data.liked : data.saved
      const countField = isLiked ? 'likeCount' : 'saveCount'
      const setActiveIds = isLiked ? setLikedReels : setSavedReelIds

      setActiveIds((current) => {
        const updated = new Set(current)
        if (active) updated.add(reelId)
        else updated.delete(reelId)
        return updated
      })
      const statusField = isLiked ? 'likedByUser' : 'savedByUser'
      setReels((current) => current.map((item) => (
        getReelId(item) === reelId
          ? {
              ...item,
              [statusField]: active,
              ...(typeof data[countField] === 'number' ? { [countField]: data[countField] } : {}),
            }
          : item
      )))
    } catch (error) {
      console.error(`Could not ${type} food reel:`, error)
      setActionError(
        error.response?.data?.message
        || (error.response?.status === 401
          ? 'Please log in as a user to like or save reels.'
          : `Could not ${type} this reel. Check your connection and try again.`),
      )
    } finally {
      updatePendingReels(reelId, false)
    }
  }

  if (loading) {
    return (
      <main className="reels-page">
        <div className="feed-status" role="status" aria-live="polite">
          <span className="feed-spinner" aria-hidden="true" />
          <span>Loading food reels...</span>
        </div>
        <FeedNavigation />
      </main>
    )
  }

  if (fetchError) {
    return (
      <main className="reels-page">
        <div className="feed-status">
          <section className="feed-feedback" role="alert">
            <span className="feed-feedback-icon" aria-hidden="true">!</span>
            <h1>Couldn&apos;t load reels</h1>
            <p>{fetchError}</p>
            <button
              className="feed-retry-button"
              type="button"
              onClick={() => setRetryCount((current) => current + 1)}
            >
              Try again
            </button>
          </section>
        </div>
        <FeedNavigation />
      </main>
    )
  }

  return (
    <main className="reels-page">
      {actionError && <p className="feed-action-error" role="alert">{actionError}</p>}
      <div className="reels-feed" ref={feedRef} onScroll={handleScroll}>
        {reels.length === 0 ? (
          <div className="feed-empty">
            No reels found in database! (Database mein food add karein)
          </div>
        ) : (
          reels.map((reel, index) => {
            const reelId = getReelId(reel) ?? index
            const isLiked = likedReels.has(reelId)
            const isSaved = savedReelIds.has(reelId)
            const isPending = pendingReelIds.has(reelId)
            const likeCount = getCount(
              reel.likesCount,
              reel.likeCount,
              reel.totalLikes,
              reel.likes,
            )
              + Number(isLiked) - Number(Boolean(reel.likedByUser))
            const savedCount = getCount(
              reel.savedCount,
              reel.saveCount,
              reel.savesCount,
              reel.bookmarkCount,
              reel.totalSaves,
              reel.saves,
              reel.bookmarks,
              reel.save,
            )
              + Number(isSaved)
              - Number(Boolean(reel.savedByUser || reel.bookmarkedByUser))
            const commentsCount = getCount(
              reel.commentsCount,
              reel.commentCount,
              reel.totalComments,
              reel.comments,
            )

            return (
              <article className="reel" key={reelId}>
                {reel.video ? (
                  <video
                    ref={(element) => { videoRefs.current[index] = element }}
                    className="reel-video"
                    src={reel.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <div className="reel-video reel-video-placeholder">Video unavailable</div>
                )}
                <div className="reel-shade" />
                <div className="reel-content">
                  <h1>{reel.name || 'Food reel'}</h1>
                  <p className="reel-description">{reel.description || 'Discover this dish.'}</p>
                  {getStoreId(reel) && (
                    <Link className="visit-store" to={`/store/${getStoreId(reel)}`}>
                      Visit store
                    </Link>
                  )}
                </div>
                <aside className="reel-actions" aria-label="Reel actions">
                  <button
                    className={`action-button${isLiked ? ' is-liked' : ''}`}
                    type="button"
                    onClick={() => handleReaction(reel, 'like')}
                    disabled={isPending}
                    aria-pressed={isLiked}
                    aria-label={`${isLiked ? 'Unlike' : 'Like'} ${reel.name || 'reel'}`}
                  >
                    <span className="action-icon">
                      {isPending ? (
                        <span className="action-spinner" aria-hidden="true" />
                      ) : <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path className={isLiked ? 'is-filled' : ''} d="M20.8 8.7c0 4.1-8.8 10.3-8.8 10.3S3.2 12.8 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
                      </svg>}
                    </span>
                    <span>{formatCount(likeCount)} likes</span>
                  </button>
                  <button
                    className={`action-button${isSaved ? ' is-saved' : ''}`}
                    type="button"
                    onClick={() => handleReaction(reel, 'save')}
                    disabled={isPending}
                    aria-pressed={isSaved}
                    aria-label={`${isSaved ? 'Remove' : 'Save'} ${reel.name || 'reel'}`}
                  >
                    <span className="action-icon">
                      {isPending ? (
                        <span className="action-spinner" aria-hidden="true" />
                      ) : <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path className={isSaved ? 'is-filled' : ''} d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />
                      </svg>}
                    </span>
                    <span>{formatCount(savedCount)} saved</span>
                  </button>
                  <button
                    className="action-button"
                    type="button"
                    onClick={() => setOpenCommentsId((current) => current === reelId ? null : reelId)}
                    aria-label={`${formatCount(commentsCount)} comments`}
                    aria-expanded={openCommentsId === reelId}
                    title="Comments"
                  >
                    <span className="action-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.2-.7L4 20l1.7-4.2a7.5 7.5 0 1 1 14.3-4.3Z" />
                      </svg>
                    </span>
                    <span>{formatCount(commentsCount)} comments</span>
                  </button>
                </aside>
                {openCommentsId === reelId && (
                  <section className="comments-panel" role="dialog" aria-label="Comments">
                    <div className="comments-panel-heading">
                      <h2>Comments</h2>
                      <button
                        type="button"
                        onClick={() => setOpenCommentsId(null)}
                        aria-label="Close comments"
                      >
                        ×
                      </button>
                    </div>
                    {Array.isArray(reel.comments) && reel.comments.length > 0 ? (
                      <ul>
                        {reel.comments.map((comment, commentIndex) => (
                          <li key={comment._id ?? comment.id ?? commentIndex}>
                            {typeof comment === 'string'
                              ? comment
                              : comment.text ?? comment.comment ?? 'Comment'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Comments are not available for this reel yet.</p>
                    )}
                  </section>
                )}
              </article>
            )
          })
        )}
      </div>
      <FeedNavigation />
    </main>
  )
}

export default Home
