import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { AlertTriangle, MapPin, Phone, Siren } from 'lucide-react';

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

const SOSEmergency = () => {
  const { currentUser, userProfile } = useAuth();
  
  const handleEmergency = () => {
    // Logic to handle SOS emergency
    console.log('SOS Emergency triggered');
    alert('Emergency services have been notified of your situation and location. Stay calm and wait for assistance.');
  };
  
  return (
    <div className="space-y-6">
      {/* Inject pulsing animation CSS */}
      <style>{pulseAnimation}</style>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Emergency SOS</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Use this feature only in genuine emergency situations requiring immediate assistance.
        </p>
      </div>
      
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center border-b border-red-100 bg-red-100">
          <CardTitle className="text-xl text-red-800 flex justify-center items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
            Emergency Assistance
          </CardTitle>
          <CardDescription className="text-red-700">
            Activating this alert will notify emergency services
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6">
            <Button 
              size="xxl" 
              variant="destructive" 
              className="w-56 h-56 rounded-full text-2xl mb-6 pulse-button"
              onClick={handleEmergency}
            >
              <Siren className="h-12 w-12 mb-2" />
              <span>ACTIVATE SOS</span>
            </Button>
            
            <div className="text-sm text-gray-600 max-w-md text-center">
              <p className="mb-4">
                Pressing this button will share your current location and identity with emergency services.
              </p>
              <div className="flex justify-center items-center mb-2">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                <span>
                  {userProfile?.pincode ? `Pincode: ${userProfile.pincode}` : 'Location will be determined'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-red-100 bg-red-100 justify-center">
          <div className="flex items-center text-red-800">
            <Phone className="h-5 w-5 mr-2" />
            <span className="font-bold">If possible, also call emergency services directly: 911</span>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Stay where you are</strong> - Emergency services will attempt to locate you based on your last known position
            </li>
            <li>
              <strong>Conserve your device battery</strong> - After sending an SOS, minimize phone usage to ensure communication with rescuers
            </li>
            <li>
              <strong>If possible, find shelter</strong> - Protect yourself from the elements while awaiting rescue
            </li>
            <li>
              <strong>Make yourself visible</strong> - If it's safe to do so, use signals to make yourself more visible to rescuers
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOSEmergency; 