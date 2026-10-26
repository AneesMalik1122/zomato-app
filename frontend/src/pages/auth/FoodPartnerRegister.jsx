import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import axios from 'axios';

const FoodPartnerRegister = () => {
  const navigate=useNavigate();

  const handleRegister=async (e) => {
    e.preventDefault();
    const bussinessName = e.target.bussinessName.value;
    const contactName = e.target.contactName.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const address = e.target.address.value;

    try {
      const response = await axios.post('http://localhost:5000/api/auth/food-partner/register', {
        bussinessName,
        contactName,
        email,
        phone,
        password,
        address
      }, {
        withCredentials: true
      });
      alert("Registration successful!");
      console.log(response.data);
      navigate("/create-food");
    } catch (error) {
      console.error("Registration failed:", error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Tab Toggle Navigation */}
        <div className="auth-tabs">
          <Link to="/user/register" className="tab-btn">
            For you
          </Link>
          <Link to="/food-partner/register" className="tab-btn active">
            For restaurants
          </Link>
        </div>

        <h2 className="auth-title">Partner With Us</h2>
        <p className="auth-subtitle">Register your restaurant or food outlet</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="businessName">Restaurant / Business Name</label>
            <input
              type="text"
              id="businessName"
              name="bussinessName"
              placeholder="Tasty Bites Cafe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactName">Owner Name</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              placeholder="Anees Ahmad"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Business Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="partner@restaurant.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="0300 1234567"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Business Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="123 Main Street, City"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Register Business
          </button>
        </form>

        <p className="auth-footer">
          Already a partner? <Link to="/food-partner/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;