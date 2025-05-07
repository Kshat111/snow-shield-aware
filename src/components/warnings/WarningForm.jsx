import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createWarning } from '../../services/incidents';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { AlertCircle } from 'lucide-react';

const WarningForm = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    affectedPincodes: '',
    severity: 'medium'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a warning.');
      return;
    }
    
    // Check if user is admin
    if (!currentUser.isAdmin) {
      setError('Only administrators can create warnings.');
      return;
    }
    
    if (!formData.title || !formData.description || !formData.affectedPincodes) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Convert comma-separated pincodes to array
      const pincodes = formData.affectedPincodes
        .split(',')
        .map(pincode => pincode.trim())
        .filter(pincode => pincode);
      
      const warningData = {
        ...formData,
        affectedPincodes: pincodes
      };
      
      const result = await createWarning(warningData);
      
      if (result?.id) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          affectedPincodes: '',
          severity: 'medium'
        });
      }
    } catch (err) {
      console.error('Error creating warning:', err);
      setError(err.message || 'Failed to create warning. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md">
          Warning created successfully!
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Warning title"
          disabled={loading}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the warning..."
          disabled={loading}
          required
        />
      </div>
      
      <div>
        <label htmlFor="affectedPincodes" className="block text-sm font-medium text-gray-700 mb-1">
          Affected Pincodes <span className="text-red-500">*</span>
        </label>
        <Input
          id="affectedPincodes"
          name="affectedPincodes"
          value={formData.affectedPincodes}
          onChange={handleChange}
          placeholder="Enter pincodes separated by commas"
          disabled={loading}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Enter multiple pincodes separated by commas (e.g., 123456, 789012)</p>
      </div>
      
      <div>
        <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
          Severity Level <span className="text-red-500">*</span>
        </label>
        <select
          id="severity"
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          disabled={loading}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Creating...' : 'Create Warning'}
      </Button>
    </form>
  );
};

export default WarningForm; 