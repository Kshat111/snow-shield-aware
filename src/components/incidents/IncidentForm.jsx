import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { createIncident } from '../../services/incidents';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const IncidentForm = ({ isSOS = false }) => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    pincode: userProfile?.pincode || '',
    type: isSOS ? 'SOS' : 'regular'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // If no files selected, clear photos
    if (files.length === 0) {
      setPhotos([]);
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Please upload images under 5MB in JPG or PNG format.');
    }
    
    setPhotos(validFiles);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to report an incident.');
      return;
    }
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const incidentData = {
        ...formData,
        userId: currentUser.uid
      };
      
      const result = await createIncident(incidentData, photos);
      
      if (result?.id) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          location: '',
          pincode: userProfile?.pincode || '',
          type: isSOS ? 'SOS' : 'regular'
        });
        setPhotos([]);
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000); // 2 second delay to show success message
      }
    } catch (err) {
      console.error('Error creating incident:', err);
      setError(err.message || 'Failed to submit incident report. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className={isSOS ? 'border-danger border-2' : ''}>
      {isSOS && (
        <div className="bg-danger text-white p-3 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
          <h2 className="text-xl font-bold">EMERGENCY SOS ALERT</h2>
          <p className="text-sm">This will alert emergency services and rescue teams</p>
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{isSOS ? 'Send SOS Alert' : 'Report Snow Incident'}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="bg-success/20 p-4 rounded text-success border border-success">
            <p className="font-bold">{isSOS ? 'SOS Alert Sent!' : 'Incident Reported Successfully!'}</p>
            <p className="text-sm mt-1">
              {isSOS 
                ? 'Emergency services have been notified. Stay safe and remain in your location if possible.'
                : 'Thank you for contributing to community safety. Your report will help others.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title {isSOS && <span className="text-red-500">*</span>}
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={isSOS ? "Emergency situation title" : "Incident title"}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description {isSOS && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={isSOS ? "Describe the emergency situation..." : "Describe the incident..."}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location details"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode {isSOS && <span className="text-red-500">*</span>}
              </label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter area pincode"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-1">
                Photos (Optional)
              </label>
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                You can upload up to 5 images (JPG, PNG) under 5MB each
              </p>
              {photos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Selected {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${isSOS ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              {loading ? 'Submitting...' : isSOS ? 'Send SOS Alert' : 'Report Incident'}
            </Button>
          </form>
        )}
      </CardContent>
      
      {!success && (
        <CardFooter className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="mr-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IncidentForm; 