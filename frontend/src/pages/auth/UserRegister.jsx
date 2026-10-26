import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

const UserRegister = () => {
  const navigate = useNavigate();

 const handleRegister = async (e) => {
  e.preventDefault();

  const fullname = e.target.fullname.value;
  const email = e.target.email.value;
  const phone = e.target.phone.value;
  const password = e.target.password.value;

  try {
    const response = await axios.post('http://localhost:5000/api/auth/user/register', {
      fullname,
      email,
      phone,
      password
    },{
      withCredentials: true
    });
    alert("Registration successful! Please log in.");

    console.log(response.data)
    navigate("/");
  } catch (error) {
    console.error("Registration failed:", error.response?.data?.message || error.message)
  }
}
 
 
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Tab Toggle Navigation */}
        <div className="auth-tabs">
          <Link to="/user/register" className="tab-btn active">
            For you
          </Link>
          <Link to="/food-partner/register" className="tab-btn">
            For restaurants
          </Link>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up as a User to get started</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullname"
              placeholder="Anees Ahmad"
              required
            />
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              placeholder="0300 1234567"
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
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/user/login">Log In</Link>
        </p>
      </div>
    </div>
  );

}

export default UserRegister;