import { useAuth } from '../context/AuthContext';
import IncidentForm from '../components/incidents/IncidentForm';
import { Card, CardContent } from '../components/ui/Card';

const ReportIncident = () => {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Incident</h1>
      <Card>
        <CardContent className="p-6">
          <IncidentForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIncident; 