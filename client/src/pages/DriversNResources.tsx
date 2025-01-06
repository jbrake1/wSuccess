import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

interface DriverResource {
  _id: string;
  note: string;
  created_by: { name: string };
  created: string;
}

interface Mission {
  _id: string;
  title: string;
}

const DriversNResourcesPage = () => {
  const { missionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [driversResources, setDriversResources] = useState<DriverResource[]>([]);
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
    const fetchDriversResources = async () => {
      try {
        const response = await api.get(`/missions/${missionId}/drivers_n_resources`);
        setDriversResources(response.data);
      } catch (error) {
        console.error('Error fetching drivers/resources:', error);
      }
    };

    fetchDriversResources();
  }, [missionId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(`/missions/${missionId}/drivers_n_resources`, {
        note: newNote
      });
      setDriversResources([response.data, ...driversResources]);
      setNewNote('');
    } catch (error) {
      console.error('Error creating driver/resource:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/missions/drivers_n_resources/${id}`);
      setDriversResources(driversResources.filter(dr => dr._id !== id));
    } catch (error: any) {
      console.error('Error deleting driver/resource:', error);
      if (error.response?.status === 403) {
        toast.error('You are not authorized to delete this entry');
      } else if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to delete entry');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Drivers & Resources
        {mission && <span className="text-gray-600 ml-2">for {mission.title}</span>}
      </h1>
      
      <form onSubmit={handleCreate} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new driver or resource"
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
        {driversResources.map(dr => (
          <div key={dr._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700">{dr.note}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Added by {dr.created_by.name} on {new Date(dr.created).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(dr._id)}
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

export default DriversNResourcesPage;
