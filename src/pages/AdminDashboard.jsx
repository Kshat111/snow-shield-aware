import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getSOSAlerts, getAllIncidents, updateIncident } from '../services/incidents';
import { AlertTriangle, Check, X, Bell, Search } from 'lucide-react';
import { formatDate } from '../lib/utils';

const AdminDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [sosAlerts, setSOSAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'incidents'
  
  // Check if user is admin or rescue team
  useEffect(() => {
    if (currentUser) {
      if (!userProfile || (userProfile.userType !== 'admin' && userProfile.userType !== 'rescueTeam')) {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [currentUser, userProfile, navigate]);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch SOS alerts
        const alertsData = await getSOSAlerts();
        setSOSAlerts(alertsData);
        
        // Fetch all incidents
        const incidentsData = await getAllIncidents();
        // Filter out SOS alerts from incidents list
        const regularIncidents = incidentsData.filter(
          incident => incident.type !== 'SOS'
        );
        setIncidents(regularIncidents);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && (userProfile?.userType === 'admin' || userProfile?.userType === 'rescueTeam')) {
      fetchData();
    }
  }, [currentUser, userProfile]);
  
  const handleResolveAlert = async (alertId) => {
    try {
      await updateIncident(alertId, {
        isActive: false,
        resolvedAt: new Date(),
        resolvedBy: currentUser.uid
      });
      
      // Update the UI by filtering out the resolved alert
      setSOSAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError('Failed to resolve alert. Please try again.');
    }
  };
  
  const handleIssueWarning = async () => {
    // In a real app, this would send notifications to users in a specific area
    alert('Warning notification feature would be implemented here');
  };
  
  // Filter the data based on search term
  const filteredData = activeTab === 'sos' 
    ? sosAlerts.filter(alert => 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.pincode.includes(searchTerm)
      )
    : incidents.filter(incident => 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.pincode.includes(searchTerm)
      );
  
  if (!currentUser || (!userProfile?.userType === 'admin' && !userProfile?.userType === 'rescueTeam')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage alerts, incidents, and send notifications
          </p>
        </div>
        
        <div className="w-full md:w-auto flex">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-full md:w-64"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
          </div>
          
          <Button 
            variant="outline" 
            className="ml-2 whitespace-nowrap"
            onClick={handleIssueWarning}
          >
            <Bell className="h-4 w-4 mr-1" />
            Issue Warning
          </Button>
        </div>
      </div>
      
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'sos' 
            ? 'border-b-2 border-primary-600 text-primary-800' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sos')}
        >
          <span className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            SOS Alerts 
            {sosAlerts.length > 0 && (
              <span className="ml-2 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {sosAlerts.length}
              </span>
            )}
          </span>
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'incidents' 
            ? 'border-b-2 border-primary-600 text-primary-800' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('incidents')}
        >
          <span className="flex items-center">
            All Incidents
            <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {incidents.length}
            </span>
          </span>
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 flex justify-between">
                <div className="space-y-2 flex-grow">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="w-24"></div>
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
      ) : filteredData.length > 0 ? (
        <div className="space-y-4">
          {filteredData.map(item => (
            <Card key={item.id} className={activeTab === 'sos' ? 'border-danger border-2' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {activeTab === 'sos' && (
                        <span className="ml-2 bg-danger text-white text-xs px-2 py-0.5 rounded">
                          SOS
                        </span>
                      )}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded bg-${item.riskLevel === 'High' ? 'danger/20 text-danger' : item.riskLevel === 'Medium' ? 'warning/20 text-warning-dark' : 'success/20 text-success-dark'}`}>
                        {item.riskLevel}
                      </span>
                    </div>
                    
                    <p className="text-gray-700">{item.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div>Location: {item.pincode}</div>
                      <div>Reported: {formatDate(item.timestamp)}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/incidents/${item.id}`)}
                    >
                      View
                    </Button>
                    
                    {activeTab === 'sos' && (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleResolveAlert(item.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>No {activeTab === 'sos' ? 'SOS alerts' : 'incidents'} found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard; 