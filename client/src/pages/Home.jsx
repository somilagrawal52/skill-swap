import React from 'react'
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
const Home = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div>
      <h1>Welcome, {user.name} 🎉</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Home
