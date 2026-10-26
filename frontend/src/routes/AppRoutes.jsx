import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'

import UserRegister from '../pages/auth/UserRegister.jsx'
import UserLogin from '../pages/auth/UserLogin.jsx'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister.jsx'
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin.jsx'
import Home from "../pages/general/Home.jsx"
import Saved from "../pages/general/Saved.jsx"
import CreateFood from "../pages/food-partner/CreateFood.jsx"
import Profile from "../pages/food-partner/profile.jsx"

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
        <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="*" element={<Navigate to="/user/login" replace />} />
        <Route path="/" element={<Home/>}></Route>
        <Route path="/create-food" element={<CreateFood/>}></Route>
        <Route path="/create-food/profile" element={<Profile />} />
        <Route path="/create-food/profile/:id" element={<Profile />} />
        <Route path="/store/:id" element={<Profile />} />
      </Routes>
    </Router>
  )
}

export default AppRoutes