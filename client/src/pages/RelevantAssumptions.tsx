import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

interface Mission {
  _id: string;
  title: string;
}

interface RelevantAssumption {
  _id: string;
  note: string;
  created: Date;
  created_by: {
    _id: string;
    name: string;
  };
}

const RelevantAssumptions = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [relevantAssumptions, setRelevantAssumptions] = useState<RelevantAssumption[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const missionResponse = await api.get(`/missions/${missionId}`);
      setMission(missionResponse.data);
      
      const relevantAssumptionsResponse = await api.get(`/missions/${missionId}/relevant_assumptions`);
      setRelevantAssumptions(relevantAssumptionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [missionId]);

  const handleAddRelevantAssumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/missions/${missionId}/relevant_assumptions`, {
        note: newNote
      });
      await fetchData(); // Refetch to get populated created_by data
      setNewNote('');
      toast.success('Relevant assumption added');
    } catch (error) {
      console.error('Error adding relevant assumption:', error);
      toast.error('Failed to add relevant assumption');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRelevantAssumption = async (relevantAssumptionId: string) => {
    if (window.confirm('Are you sure you want to delete this relevant assumption?')) {
      try {
        await api.delete(`/missions/${missionId}/relevant_assumptions/${relevantAssumptionId}`);
        setRelevantAssumptions(relevantAssumptions.filter(ra => ra._id !== relevantAssumptionId));
        toast.success('Relevant assumption deleted');
      } catch (error) {
        console.error('Error deleting relevant assumption:', error);
        toast.error('Failed to delete relevant assumption');
      }
    }
  };

  if (!mission) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relevant Assumptions for Mission: {mission.title}</h1>

      <form onSubmit={handleAddRelevantAssumption} className="mb-8">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new relevant assumption..."
          className="w-full p-2 border rounded mb-2"
          rows={3}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSubmitting || !newNote.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Relevant Assumption'}
        </button>
      </form>

      <div className="space-y-4">
        {relevantAssumptions.map(relevantAssumption => (
          <div key={relevantAssumption._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">
                  {new Date(relevantAssumption.created).toLocaleDateString()} by {relevantAssumption.created_by.name}
                </p>
                <p className="mt-2">{relevantAssumption.note}</p>
              </div>
              <button
                onClick={() => handleDeleteRelevantAssumption(relevantAssumption._id)}
                className="text-red-500 hover:text-red-700"
                title="Delete relevant assumption"
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

export default RelevantAssumptions;
