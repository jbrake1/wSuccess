import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1>Welcome to Our Application</h1>
      <div className="welcome-links">
        <Link to="/login" className="welcome-link">Login</Link>
        <Link to="/register" className="welcome-link">Create Account</Link>
        <Link to="/missions" className="welcome-link">Missions</Link>
        <Link to="/me" className="welcome-link">My Account</Link>
      </div>
    </div>
  );
};

export default Welcome;
