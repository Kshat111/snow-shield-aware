import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import IncidentCard from '../components/incidents/IncidentCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getIncidentsByPincode, getAllIncidents } from '../services/incidents';
import { Bell, AlertTriangle, FilePlus } from 'lucide-react';

// Custom CSS for pulsing animation
const pulseAnimation = `
  @keyframes pulse-animation {
    0% {
      filter: brightness(1);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    50% {
      filter: brightness(1.1);
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
      filter: brightness(1);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
  }
  .pulse-button {
    animation: pulse-animation 2s infinite;
  }
`;

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError('');
        
        // If user has a pincode, get local incidents first
        let localIncidents = [];
        if (userProfile?.pincode) {
          localIncidents = await getIncidentsByPincode(userProfile.pincode);
        }
        
        // Get some global incidents too
        const allIncidents = await getAllIncidents();
        
        // Combine and prioritize SOS alerts
        const combined = [...allIncidents];
        
        if (localIncidents.length > 0) {
          // Add local incidents if not already in the array (by ID)
          localIncidents.forEach(localIncident => {
            if (!combined.some(incident => incident.id === localIncident.id)) {
              combined.push(localIncident);
            }
          });
        }
        
        // Sort by type (SOS first) and then by timestamp
        combined.sort((a, b) => {
          if (a.type === 'SOS' && b.type !== 'SOS') return -1;
          if (a.type !== 'SOS' && b.type === 'SOS') return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setIncidents(combined.slice(0, 6)); // Show at most 6 incidents
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incidents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [userProfile]);

  // Filter for local incidents (for the "Near You" section)
  const localIncidents = userProfile?.pincode 
    ? incidents.filter(incident => incident.pincode === userProfile.pincode)
    : [];

  const educationalContent = [
    {
      title: "Avalanche Safety Basics",
      description: "Learn the fundamental safety practices for avalanche terrain.",
      link: "/education/avalanche-basics"
    },
    {
      title: "Winter Survival Kit",
      description: "Essential items to carry for winter emergencies in snow conditions.",
      link: "/education/survival-kit"
    },
    {
      title: "Reading Snow Conditions",
      description: "How to identify dangerous snow conditions that could lead to avalanches.",
      link: "/education/snow-conditions"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Inject pulsing animation CSS */}
      <style>{pulseAnimation}</style>
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow md:w-2/3">
          <Card className="h-full">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {currentUser ? (
                  <>Welcome, {userProfile?.name || currentUser.displayName || 'Friend'}</>
                ) : (
                  'Welcome to Snow Safety'
                )}
              </h1>
              <p className="text-gray-600 mb-6">
                Stay informed about snow conditions and safety alerts in your area. Report incidents 
                to help others and access educational resources to stay safe in snowy conditions.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link to="/reports/new">
                  <Button size="xxl" className="text-base px-6 py-5">
                    <FilePlus className="h-6 w-6 mr-2" />
                    Report Incident
                  </Button>
                </Link>
                <Link to="/sos">
                  <Button 
                    size="xxl" 
                    variant="destructive" 
                    className="text-base px-6 py-5 pulse-button"
                  >
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    SOS Emergency
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/3">
          <WeatherWidget />
        </div>
      </div>
      
      {/* Near You Section (if user has pincode) */}
      {userProfile?.pincode && localIncidents.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-warning" />
              Alerts Near You
            </h2>
            <Link to="/alerts" className="text-primary-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localIncidents.slice(0, 3).map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Reports Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
          <Link to="/reports" className="text-primary-600 text-sm hover:underline">
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-16 bg-gray-100"></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="h-32 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center text-danger">
              <p>{error}</p>
            </CardContent>
          </Card>
        ) : incidents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.slice(0, 6).map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <p>No incidents reported yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Educational Resources Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Educational Resources</h2>
          <Link to="/education" className="text-primary-600 text-sm hover:underline">
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {educationalContent.map((resource, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <Link to="/education">
                  <Button variant="outline" size="sm">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 