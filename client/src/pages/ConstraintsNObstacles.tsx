import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ConstraintObstacle {
  _id: string;
  note: string;
  created_by: { name: string };
  created: string;
}

interface Mission {
  _id: string;
  title: string;
}

const ConstraintsNObstaclesPage = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!missionId) {
    console.error('Mission ID is undefined');
    navigate('/missions');
    return null;
  }
  const [constraintsObstacles, setConstraintsObstacles] = useState<ConstraintObstacle[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await api.get(`/missions/${missionId}`);
        setMission(response.data);
      } catch (error) {
        console.error('Error fetching mission:', error);
      }
    };

    fetchMission();
  }, [missionId]);

  useEffect(() => {
    const fetchConstraintsObstacles = async () => {
      try {
        const response = await api.get(`/missions/${missionId}/constraints_n_obstacles`);
        setConstraintsObstacles(response.data);
      } catch (error) {
        console.error('Error fetching constraints/obstacles:', error);
      }
    };

    fetchConstraintsObstacles();
  }, [missionId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(`/missions/${missionId}/constraints_n_obstacles`, {
        note: newNote
      });
      setConstraintsObstacles([response.data, ...constraintsObstacles]);
      setNewNote('');
    } catch (error) {
      console.error('Error creating constraint/obstacle:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/constraints_n_obstacles/${id}`);
      setConstraintsObstacles(constraintsObstacles.filter(co => co._id !== id));
    } catch (error) {
      console.error('Error deleting constraint/obstacle:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Constraints & Obstacles
        {mission && <span className="text-gray-600 ml-2">for {mission.title}</span>}
      </h1>
      
      <form onSubmit={handleCreate} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new constraint or obstacle"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </form>

      <div className="space-y-4">
        {constraintsObstacles.map(co => (
          <div key={co._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700">{co.note}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Added by {co.created_by.name} on {new Date(co.created).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(co._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstraintsNObstaclesPage;
