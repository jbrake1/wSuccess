import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

interface Mission {
  _id: string;
  title: string;
}

interface RelevantFact {
  _id: string;
  note: string;
  created: Date;
  created_by: {
    _id: string;
    name: string;
  };
}

const RelevantFacts = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [relevantFacts, setRelevantFacts] = useState<RelevantFact[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const missionResponse = await api.get(`/missions/${missionId}`);
      setMission(missionResponse.data);
      
      const relevantFactsResponse = await api.get(`/missions/${missionId}/relevant_facts`);
      setRelevantFacts(relevantFactsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [missionId]);

  const handleAddRelevantFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/missions/${missionId}/relevant_facts`, {
        note: newNote
      });
      await fetchData(); // Refetch to get populated created_by data
      setNewNote('');
      toast.success('Relevant fact added');
    } catch (error) {
      console.error('Error adding relevant fact:', error);
      toast.error('Failed to add relevant fact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRelevantFact = async (relevantFactId: string) => {
    if (window.confirm('Are you sure you want to delete this relevant fact?')) {
      try {
        await api.delete(`/missions/${missionId}/relevant_facts/${relevantFactId}`);
        setRelevantFacts(relevantFacts.filter(rf => rf._id !== relevantFactId));
        toast.success('Relevant fact deleted');
      } catch (error) {
        console.error('Error deleting relevant fact:', error);
        toast.error('Failed to delete relevant fact');
      }
    }
  };

  if (!mission) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relevant Facts for Mission: {mission.title}</h1>

      <form onSubmit={handleAddRelevantFact} className="mb-8">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new relevant fact..."
          className="w-full p-2 border rounded mb-2"
          rows={3}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSubmitting || !newNote.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Relevant Fact'}
        </button>
      </form>

      <div className="space-y-4">
        {relevantFacts.map(relevantFact => (
          <div key={relevantFact._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">
                  {new Date(relevantFact.created).toLocaleDateString()} by {relevantFact.created_by.name}
                </p>
                <p className="mt-2">{relevantFact.note}</p>
              </div>
              <button
                onClick={() => handleDeleteRelevantFact(relevantFact._id)}
                className="text-red-500 hover:text-red-700"
                title="Delete relevant fact"
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

export default RelevantFacts;
