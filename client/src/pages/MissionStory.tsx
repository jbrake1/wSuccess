import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import Successes from './Successes';
import DriversNResources from './DriversNResources';
import ConstraintsNObstacles from './ConstraintsNObstacles';
import RelevantFacts from './RelevantFacts';
import RelevantAssumptions from './RelevantAssumptions';

interface Mission {
  _id: string;
  title: string;
  description?: string;
}

const MissionStory = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    if (missionId) {
      api.get(`/missions/${missionId}`)
        .then(response => setMission(response.data))
        .catch(() => toast.error('Failed to load mission details'));
    }
  }, [missionId]);

  if (!mission) return null;

  return (
    <div className="space-y-8">
      <div className="mission-header bg-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-3xl font-bold mb-2">{mission.title}</h1>
        {mission.description && (
          <p className="text-gray-600">{mission.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Successes />
        <DriversNResources />
        <ConstraintsNObstacles />
        <RelevantFacts />
        <RelevantAssumptions />
      </div>
    </div>
  );
};

export default MissionStory;
