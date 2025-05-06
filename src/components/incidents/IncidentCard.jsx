import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate, truncateText, getRiskLevelColor } from '../../lib/utils';
import { MapPin, Calendar, AlertCircle, ChevronRight } from 'lucide-react';

const IncidentCard = ({ incident }) => {
  if (!incident) return null;
  
  const { 
    id, 
    title, 
    description, 
    riskLevel, 
    pincode, 
    timestamp, 
    photos = [],
    type,
  } = incident;

  const riskColor = getRiskLevelColor(riskLevel);
  const isSOS = type === 'SOS';
  
  return (
    <Card className={`overflow-hidden ${isSOS ? 'border-danger border-2' : ''}`}>
      {isSOS && (
        <div className="bg-danger text-white p-2 text-center font-bold">
          SOS EMERGENCY ALERT
        </div>
      )}
      
      <CardHeader className={`pb-0 ${isSOS ? 'bg-danger/10' : ''}`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className={`px-2 py-1 rounded text-xs text-white font-medium bg-${riskColor}`}>
            {riskLevel}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {photos.length > 0 && (
          <div className="relative w-full h-40 mb-4 overflow-hidden rounded">
            <img 
              src={photos[0]} 
              alt={title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                +{photos.length - 1} more
              </div>
            )}
          </div>
        )}
        
        <p className="text-gray-700 mb-4">{truncateText(description, 120)}</p>
        
        <div className="flex flex-col space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Location: {pincode}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Reported: {formatDate(timestamp)}</span>
          </div>
          
          {isSOS && (
            <div className="flex items-center text-danger mt-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="font-semibold">Requires immediate attention</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="justify-end bg-gray-50 py-3">
        <Link to={`/incidents/${id}`}>
          <Button variant="ghost" size="sm" className="text-primary-600">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default IncidentCard; 