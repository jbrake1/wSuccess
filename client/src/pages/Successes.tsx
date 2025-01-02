import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

interface Mission {
  _id: string;
  title: string;
}

interface Success {
  _id: string;
  note: string;
  created: Date;
  created_by: {
    _id: string;
    name: string;
  };
}

const Successes = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const missionResponse = await api.get(`/missions/${missionId}`);
      setMission(missionResponse.data);
      
      const successesResponse = await api.get(`/missions/${missionId}/successes`);
      setSuccesses(successesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [missionId]);

  const handleAddSuccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/missions/${missionId}/successes`, {
        note: newNote
      });
      await fetchData(); // Refetch to get populated created_by data
      setNewNote('');
      toast.success('Success note added');
    } catch (error) {
      console.error('Error adding success:', error);
      toast.error('Failed to add success note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuccess = async (successId: string) => {
    if (window.confirm('Are you sure you want to delete this success note?')) {
      try {
        await api.delete(`/missions/successes/${successId}`);
        setSuccesses(successes.filter(s => s._id !== successId));
        toast.success('Success note deleted');
      } catch (error) {
        console.error('Error deleting success:', error);
        toast.error('Failed to delete success note');
      }
    }
  };

  if (!mission) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Successes for Mission: {mission.title}</h1>

      <form onSubmit={handleAddSuccess} className="mb-8">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new success note..."
          className="w-full p-2 border rounded mb-2"
          rows={3}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSubmitting || !newNote.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Success'}
        </button>
      </form>

      <div className="space-y-4">
        {successes.map(success => (
          <div key={success._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">
                  {new Date(success.created).toLocaleDateString()} by {success.created_by.name}
                </p>
                <p className="mt-2">{success.note}</p>
              </div>
              <button
                onClick={() => handleDeleteSuccess(success._id)}
                className="text-red-500 hover:text-red-700"
                title="Delete success note"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Successes;
