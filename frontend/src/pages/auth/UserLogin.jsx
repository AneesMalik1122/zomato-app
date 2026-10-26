import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import axios from 'axios';


const UserLogin = () => {
  
  const navigate=useNavigate();

  const handleLogin=async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post('http://localhost:5000/api/auth/user/login', {
        email,
        password
      }, {
        withCredentials: true
      });
      alert("Login successful!");

      console.log(response.data)
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
    }
  }
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in as a User to continue</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
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
            Log In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/user/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;