import React, { useState } from 'react';
import { User } from '../models/User';
import api from '../services/api.ts';

interface CollaboratorFormProps {
  missionId: string;
}

const CollaboratorForm: React.FC<CollaboratorFormProps> = ({ missionId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [addedUsers, setAddedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const fetchUsers = async (page: number, search: string) => {
    try {
      const response = await api.get(`/users?page=${page}&search=${search}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddCollaborator = async (userId: string) => {
    try {
      await api.post(`/missions/${missionId}/collaborators`, { userId });
      setAddedUsers([...addedUsers, userId]);
      setMessage('User added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding collaborator:', error);
    }
  };

  return (
    <div className="collaborator-form">
      <h3>Add Collaborators</h3>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          fetchUsers(1, e.target.value);
        }}
      />
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name}
            {addedUsers.includes(user._id) ? (
              <button disabled>-</button>
            ) : (
              <button onClick={() => handleAddCollaborator(user._id)}>+</button>
            )}
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            fetchUsers(newPage, searchTerm);
          }}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            fetchUsers(newPage, searchTerm);
          }}
        >
          Next
        </button>
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default CollaboratorForm;
