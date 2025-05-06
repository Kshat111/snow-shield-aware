import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { createIncident } from '../../services/incidents';
import { AlertTriangle } from 'lucide-react';

const IncidentForm = ({ isSOS = false }) => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState([]);
  
  const [formData, setFormData] = useState({
    title: isSOS ? 'SOS Emergency Alert' : '',
    description: '',
    riskLevel: isSOS ? 'High' : 'Medium',
    pincode: userProfile?.pincode || '',
    type: isSOS ? 'SOS' : 'incident'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
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
    
    if (!formData.title) {
      setError('Please provide a title for the incident.');
      return;
    }
    
    if (!formData.description) {
      setError('Please provide a description of the incident.');
      return;
    }
    
    if (!formData.pincode) {
      setError('Please provide a location pincode.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const incidentData = {
        ...formData,
        reportedBy: currentUser.uid
      };
      
      const result = await createIncident(incidentData, photos);
      
      if (result?.id) {
        setSuccess(true);
        
        // Redirect after short delay for SOS alerts
        if (isSOS) {
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          // Clear form for regular incident report
          setFormData({
            title: '',
            description: '',
            riskLevel: 'Medium',
            pincode: userProfile?.pincode || '',
            type: 'incident'
          });
          setPhotos([]);
        }
      }
    } catch (err) {
      console.error('Error creating incident:', err);
      setError('Failed to submit incident report. Please try again.');
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
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title describing the incident"
                disabled={isSOS || loading}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the incident or situation"
                rows={4}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                id="riskLevel"
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                disabled={isSOS || loading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Location Pincode
              </label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter area pincode"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-1">
                Photos (Optional)
              </label>
              <Input
                id="photos"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handlePhotoChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Upload up to 5 photos (JPG/PNG, max 5MB each)</p>
              
              {photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {error && (
              <div className="p-3 bg-danger/10 border border-danger rounded text-danger text-sm">
                {error}
              </div>
            )}
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
          <Button
            type="submit"
            variant={isSOS ? 'destructive' : 'default'}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : isSOS ? 'Send SOS Alert' : 'Submit Report'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IncidentForm; 