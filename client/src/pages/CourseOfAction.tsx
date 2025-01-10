import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

interface Mission {
  _id: string;
  title: string;
}

interface CourseOfAction {
  _id: string;
  note: string;
  created: Date;
  created_by: {
    _id: string;
    name: string;
  };
}

const CourseOfAction = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [courseOfActions, setCourseOfActions] = useState<CourseOfAction[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const missionResponse = await api.get(`/missions/${missionId}`);
      setMission(missionResponse.data);
      
      const courseOfActionsResponse = await api.get(`/missions/${missionId}/course_of_actions`);
      setCourseOfActions(courseOfActionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [missionId]);

  const handleAddCourseOfAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/missions/${missionId}/course_of_actions`, {
        note: newNote
      });
      await fetchData(); // Refetch to get populated created_by data
      setNewNote('');
      toast.success('Course of action note added');
    } catch (error) {
      console.error('Error adding course of action:', error);
      toast.error('Failed to add course of action note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourseOfAction = async (courseOfActionId: string) => {
    if (window.confirm('Are you sure you want to delete this course of action note?')) {
      try {
        await api.delete(`/missions/${missionId}/course_of_actions/${courseOfActionId}`);
        setCourseOfActions(courseOfActions.filter(c => c._id !== courseOfActionId));
        toast.success('Course of action note deleted');
      } catch (error) {
        console.error('Error deleting course of action:', error);
        toast.error('Failed to delete course of action note');
      }
    }
  };

  if (!mission) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course of Action for Mission: {mission.title}</h1>

      <form onSubmit={handleAddCourseOfAction} className="mb-8">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new course of action note..."
          className="w-full p-2 border rounded mb-2"
          rows={3}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSubmitting || !newNote.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Course of Action'}
        </button>
      </form>

      <div className="space-y-4">
        {courseOfActions.map(courseOfAction => (
          <div key={courseOfAction._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">
                  {new Date(courseOfAction.created).toLocaleDateString()} by {courseOfAction.created_by.name}
                </p>
                <p className="mt-2">{courseOfAction.note}</p>
              </div>
              <button
                onClick={() => handleDeleteCourseOfAction(courseOfAction._id)}
                className="text-red-500 hover:text-red-700"
                title="Delete course of action note"
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

export default CourseOfAction;
