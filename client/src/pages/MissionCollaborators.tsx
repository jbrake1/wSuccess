import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const getUsers = async () => {
  const response = await api.get('/missions/users');
  return response.data.users;
};

const getMissionCollaborators = async (missionId: string) => {
  const response = await api.get(`/missions/${missionId}/debug`);
  // Get full user details for each collaborator
  const usersResponse = await api.get('/missions/users');
  const allUsers = usersResponse.data.users;
  
  return response.data.mission.assignedTo.map((userId: string) => 
    allUsers.find((user: User) => user._id === userId)
  ).filter(Boolean);
};

interface User {
  _id: string;
  name: string;
  email: string;
}

const MissionCollaborators: React.FC = () => {
  const { missionId, missionName } = useParams<{ missionId: string, missionName: string }>();
  const [users, setUsers] = useState<User[]>([]);
const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

const handleAddToMission = async (userId: string) => {
  try {
    console.log('Current user ID:', localStorage.getItem('userId'));
    console.log('Mission ID:', missionId);
    const response = await api.post(`/missions/${missionId}/collaborators`, { 
      missionId,
      userId 
    });
    console.log('Response:', response.data);
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUsers([...selectedUsers, user]);
      setUsers(users.filter(u => u._id !== userId));
    }
  } catch (error) {
    console.error('Error adding collaborator:', error);
  }
};

const handleRemoveFromMission = async (userId: string) => {
  try {
    const response = await api.delete(`/missions/${missionId}/collaborators/${userId}`);
    if (response.status === 204) {
      const user = selectedUsers.find(u => u._id === userId);
      if (user) {
        setUsers(prevUsers => [...prevUsers, user]);
        setSelectedUsers(prevSelected => prevSelected.filter(u => u._id !== userId));
      }
    }
  } catch (error) {
    console.error('Error removing collaborator:', error);
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allUsers, missionCollaborators] = await Promise.all([
          getUsers(),
          getMissionCollaborators(missionId!)
        ]);
        
        setSelectedUsers(missionCollaborators);
        setUsers(allUsers.filter((user: User) => 
          !missionCollaborators.some((collab: User) => collab._id === user._id)
        ));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [missionId]);

  return (
    <div>
      <h1>Mission Collaborators</h1>
      <h2>{missionName}</h2>
      <p>Collaborators for Mission ID: {missionId}</p>
      
      <h3>All Unselected Users</h3>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleAddToMission(user._id)}
              style={{ marginLeft: '10px' }}
            >
              Add to Mission
            </Button>
          </li>
        ))}
      </ul>

      <h3>Selected Users</h3>
      <ul>
        {selectedUsers.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={() => handleRemoveFromMission(user._id)}
              style={{ marginLeft: '10px' }}
            >
              Drop from Mission
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MissionCollaborators;
