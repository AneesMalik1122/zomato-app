import axios from 'axios'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import './CreateFood.css'

const CreateFood = () => {
  const navigate = useNavigate()
  const videoInputRef = useRef(null)
  const [video, setVideo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [requiresLogin, setRequiresLogin] = useState(false)

  const handleVideoChange = (event) => {
    setVideo(event.target.files?.[0] ?? null)
  }

  const handleVideoRemove = () => {
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
    setVideo(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setRequiresLogin(false)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      await axios.post('http://localhost:5000/api/food/', formData, {
        withCredentials: true,
      })

      navigate('/')
    } catch (error) {
      console.error('Failed to create food:', error)
      const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401
      setRequiresLogin(isUnauthorized)
      setErrorMessage(
        (axios.isAxiosError(error) && error.response?.data?.message)
        || (isUnauthorized
          ? 'Your food-partner session is not authorized. Please log in again.'
          : error instanceof Error ? error.message : 'Could not create food. Please try again.')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="create-food-page">
      <div className="create-food-content">
        <header className="create-food-heading">
          <span className="create-food-eyebrow">FOOD PARTNER</span>
          <h1>Create a food post</h1>
          <p>Share a dish from your kitchen with the community.</p>
        </header>

        <form className="create-food-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="create-food-feedback create-food-error" role="alert">
              <p>{errorMessage}</p>
              {requiresLogin && (
                <Link className="create-food-login-link" to="/food-partner/login">
                  Log in as a food partner
                </Link>
              )}
            </div>
          )}
          <div className="create-food-field">
            <label htmlFor="food-video">Food video</label>
            <p className="create-food-hint" id="food-video-hint">
              Choose a video that shows your dish in its best light.
            </p>
            <input
              id="food-video"
              name="video"
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoChange}
              aria-describedby="food-video-hint"
              required
            />
            {video && (
              <div className="create-food-video-actions">
                <span className="create-food-video-name" title={video.name}>
                  Selected: {video.name}
                </span>
                <div className="create-food-video-buttons">
                  <button
                    className="create-food-video-button"
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    Change video
                  </button>
                  <button
                    className="create-food-video-button create-food-video-remove"
                    type="button"
                    onClick={handleVideoRemove}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="create-food-field">
            <label htmlFor="food-name">Food name</label>
            <input
              id="food-name"
              name="name"
              type="text"
              placeholder="e.g. Classic Margherita Pizza"
              autoComplete="off"
              required
            />
          </div>

          <div className="create-food-field">
            <label htmlFor="food-description">Description</label>
            <textarea
              id="food-description"
              name="description"
              placeholder="Tell everyone what makes this dish special..."
              rows="5"
              required
            />
          </div>

          <button className="create-food-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading food...' : 'Create food'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default CreateFood
