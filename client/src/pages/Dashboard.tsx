import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user?.name}</h2>
      <div className="dashboard-content">
        <p>Your missions will appear here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
