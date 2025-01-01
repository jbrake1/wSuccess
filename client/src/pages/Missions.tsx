import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';
import { toast } from 'react-toastify';

interface Mission {
  _id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
}

const Missions = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/missions')
        .then(response => setMissions(response.data))
        .catch(() => toast.error('Failed to load missions'));
    }
  }, [user]);

  return (
    <div className="missions-container">
      <h2>Missions</h2>
      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) {
            toast.error('Title is required');
            return;
          }
          if (!description.trim()) {
            toast.error('Description is required');
            return;
          }

          setIsSubmitting(true);
          try {
            const { data } = await api.post('/missions', {
              title,
              description,
              status: 'pending'
            });
            setMissions([...missions, data]);
            setTitle('');
            setDescription('');
            toast.success('Mission created successfully');
          } catch (err) {
            toast.error('Failed to create mission');
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter mission title"
          required
          disabled={isSubmitting}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter mission description"
          required
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Mission'}
        </button>
      </form>

      <div className="missions-list">
        {missions.map(mission => (
          <div key={mission._id} className="mission-item">
            <h3>{mission.title}</h3>
            <p>{mission.description}</p>
            <p>Status: {mission.status}</p>
            {mission.dueDate && <p>Due: {new Date(mission.dueDate).toLocaleDateString()}</p>}
            <Link 
              to={`/missions/${mission._id}/collaborators/${encodeURIComponent(mission.title)}`}
              className="collaborators-link"
            >
              View Collaborators
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Missions;