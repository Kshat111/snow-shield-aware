import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import IncidentCard from '../components/incidents/IncidentCard';
import { getIncidentsByPincode, getAllIncidents } from '../services/incidents';
import { Search, MapPin, AlertTriangle } from 'lucide-react';

const Alerts = () => {
  const { userProfile } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchPincode, setSearchPincode] = useState('');
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'local', 'sos'
  
  // Initial load of all incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError('');
        
        let allIncidents = await getAllIncidents();
        
        // Filter out SOS alerts for non-admin users
        if (userProfile?.userType !== 'admin') {
          allIncidents = allIncidents.filter(incident => incident.type !== 'SOS');
        }
        
        // Sort by timestamp (newest first)
        allIncidents.sort((a, b) => {
          // SOS alerts always first
          if (a.type === 'SOS' && b.type !== 'SOS') return -1;
          if (a.type !== 'SOS' && b.type === 'SOS') return 1;
          // Then sort by date
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setIncidents(allIncidents);
        setFilteredIncidents(allIncidents);
        
        // If user has pincode, set active filter to 'local'
        if (userProfile?.pincode) {
          setSearchPincode(userProfile.pincode);
          handleFilterChange('local');
        }
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incidents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncidents();
  }, [userProfile]);
  
  // Filter incidents when active filter changes
  useEffect(() => {
    if (incidents.length === 0) return;
    
    let filtered = [...incidents];
    
    if (activeFilter === 'local' && searchPincode) {
      filtered = incidents.filter(incident => 
        incident.pincode === searchPincode
      );
    } else if (activeFilter === 'sos') {
      filtered = incidents.filter(incident => 
        incident.type === 'SOS'
      );
    }
    
    setFilteredIncidents(filtered);
  }, [activeFilter, searchPincode, incidents]);
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchPincode) {
      // If search is cleared, show all incidents
      setFilteredIncidents(incidents);
      setActiveFilter('all');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Search for incidents with the given pincode
      const localIncidents = await getIncidentsByPincode(searchPincode);
      
      // Filter out SOS alerts for non-admin users
      const filteredLocalIncidents = userProfile?.userType === 'admin' 
        ? localIncidents 
        : localIncidents.filter(incident => incident.type !== 'SOS');
      
      if (filteredLocalIncidents.length === 0) {
        setError(`No incidents found for pincode ${searchPincode}`);
      }
      
      setFilteredIncidents(filteredLocalIncidents);
      setActiveFilter('local');
    } catch (err) {
      console.error('Error searching incidents:', err);
      setError('Failed to search incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Incidents</h1>
          <p className="text-gray-600">
            View and search for snow safety alerts and incident reports
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Input
              type="text"
              placeholder="Search by pincode..."
              value={searchPincode}
              onChange={(e) => setSearchPincode(e.target.value)}
              className="pr-10"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </span>
          </div>
          <Button type="submit" className="ml-2">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
      
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('all')}
        >
          All Incidents
        </Button>
        
        <Button
          variant={activeFilter === 'local' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('local')}
          disabled={!searchPincode}
        >
          <MapPin className="h-4 w-4 mr-1" />
          {searchPincode ? `Pincode: ${searchPincode}` : 'Local Alerts'}
        </Button>
        
        {userProfile?.userType === 'admin' && (
          <Button
            variant={activeFilter === 'sos' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('sos')}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            SOS Alerts
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error && filteredIncidents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-danger mb-2">{error}</p>
            <p className="text-gray-600">Try a different pincode or view all incidents</p>
          </CardContent>
        </Card>
      ) : filteredIncidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No incidents found. Adjust your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Alerts; 