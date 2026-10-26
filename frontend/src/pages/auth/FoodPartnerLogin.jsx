import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import axios from 'axios';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const response = await axios.post('http://localhost:5000/api/auth/food-partner/login', {
        email,
        password
      }, {
        withCredentials: true
      });
      alert("Login successful!");
      console.log(response.data);
      navigate("/create-food");
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      alert("invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Partner Login</h2>
        <p className="auth-subtitle">Log in to manage your restaurant</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Business Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="partner@restaurant.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Log In to Portal
          </button>
        </form>

        <p className="auth-footer">
          Want to register a new restaurant? <Link to="/food-partner/register">Register Business</Link>
        </p>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;
