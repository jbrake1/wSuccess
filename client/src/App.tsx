import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import MissionCollaborators from './pages/MissionCollaborators';
import Successes from './pages/Successes';
import DriversNResources from './pages/DriversNResources';
import Users from './pages/Users';
import EditUser from './pages/EditUser';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/missions/:missionId/collaborators/:missionName" element={<MissionCollaborators />} />
              <Route path="/missions/:missionId/successes" element={<Successes />} />
              <Route path="/missions/:missionId/drivers_n_resources" element={<DriversNResources />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:userId/edit" element={<EditUser />} />
            </Route>
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
