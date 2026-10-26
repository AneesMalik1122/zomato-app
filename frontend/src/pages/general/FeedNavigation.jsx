import { NavLink } from 'react-router-dom'

function FeedNavigation() {
  return (
    <nav className="feed-bottom-nav" aria-label="Main navigation">
      <NavLink className="feed-nav-link" to="/" end>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </svg>
        <span>Home</span>
      </NavLink>
      <NavLink className="feed-nav-link" to="/saved">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />
        </svg>
        <span>Saved</span>
      </NavLink>
    </nav>
  )
}

export default FeedNavigation
