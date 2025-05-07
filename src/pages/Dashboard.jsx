import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import IncidentCard from '../components/incidents/IncidentCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getIncidentsByPincode, getAllIncidents, getWarningsForPincode } from '../services/incidents';
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
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch all incidents
        const allIncidents = await getAllIncidents();
        
        // Filter out SOS incidents for non-admin users
        const filteredIncidents = userProfile?.userType === 'admin' 
          ? allIncidents 
          : allIncidents.filter(incident => incident.type !== 'SOS');
        
        setIncidents(filteredIncidents);
        
        // Fetch warnings for user's pincode
        if (userProfile?.pincode) {
          const warningsData = await getWarningsForPincode(userProfile.pincode);
          
          // Filter out expired warnings
          const now = new Date();
          const activeWarnings = warningsData.filter(warning => 
            !warning.expiryTime || new Date(warning.expiryTime) > now
          );
          
          setWarnings(activeWarnings);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, userProfile]);

  // Format date for warnings
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
      
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      
      {/* Warnings Section - Show at the top if there are active warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center mb-3">
            <Bell className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-lg font-bold text-yellow-700">Active Warnings in Your Area</h2>
          </div>
          
          <div className="space-y-4">
            {warnings.map(warning => (
              <div key={warning.id} className="bg-white p-4 rounded-md border border-yellow-200">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">
                    {warning.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs text-white font-medium bg-${warning.severity === 'high' ? 'red-500' : warning.severity === 'medium' ? 'amber-500' : 'yellow-500'}`}>
                    {warning.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 my-2">{warning.description}</p>
                <div className="text-xs text-gray-500 flex flex-wrap gap-x-4">
                  <span>Issued by: {warning.createdByName || 'Admin'}</span>
                  <span>Issued: {formatDate(warning.timestamp)}</span>
                  {warning.expiryTime && (
                    <span>Expires: {formatDate(warning.expiryTime)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
                {currentUser && (
                  <Link to="/sos">
                    <Button 
                      size="xxl" 
                      variant="destructive" 
                      className="text-base px-6 py-5 pulse-button bg-red-600 hover:bg-red-700 text-white"
                    >
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      SOS Emergency
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/3">
          <WeatherWidget />
        </div>
      </div>
      
      {/* Near You Section (if user has pincode) */}
      {userProfile?.pincode && warnings.length > 0 && (
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
            {warnings.slice(0, 3).map(warning => (
              <Card key={warning.id} className="bg-yellow-50 border-l-4 border-yellow-400">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{warning.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs text-white font-medium bg-${warning.severity === 'high' ? 'red-500' : warning.severity === 'medium' ? 'amber-500' : 'yellow-500'}`}>
                      {warning.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 my-2">{warning.description}</p>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-4">
                    <span>Issued by: {warning.createdByName || 'Admin'}</span>
                    <span>Issued: {formatDate(warning.timestamp)}</span>
                    {warning.expiryTime && (
                      <span>Expires: {formatDate(warning.expiryTime)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Reports Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
          <Link to="/alerts" className="text-primary-600 text-sm hover:underline">
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
              <IncidentCard 
                key={`${incident.id}-${incident.timestamp}`} 
                incident={incident}
                showType={true}
              />
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