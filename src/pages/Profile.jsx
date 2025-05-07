import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, MapPin, Shield, Save, AlertTriangle, Phone, LogOut } from 'lucide-react';
import { getFirebaseErrorMessage, logFirebaseError } from '../utils/firebaseErrorHandler';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pincode: '',
    phone: '',
    userType: ''
  });

  useEffect(() => {
    // If not logged in, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Set a timeout to prevent indefinite loading
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    
    // Initialize form with current user data when userProfile is available
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: currentUser.email || '',
        pincode: userProfile.pincode || '',
        phone: userProfile.phone || '',
        userType: userProfile.userType || 'user'
      });
      setInitialLoading(false);
      clearTimeout(timer);
    } else if (currentUser) {
      // Fallback if userProfile is not available but user is logged in
      setFormData({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        pincode: '',
        phone: '',
        userType: 'user'
      });
    }
    
    return () => clearTimeout(timer);
  }, [currentUser, userProfile, navigate]);

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
      setError('You must be logged in to update your profile.');
      return;
    }
    
    // Validate input
    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }
    
    // Validate phone
    if (formData.phone && !/^[0-9+\s()-]{7,15}$/.test(formData.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Update profile using the context method
      await updateUserProfile(currentUser.uid, {
        name: formData.name,
        pincode: formData.pincode,
        phone: formData.phone,
        // We don't update userType here as that should be an admin function
      });
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      // Log detailed error for debugging
      logFirebaseError(err, 'Profile Update');
      
      // Set user-friendly error message
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Add logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading spinner only during initial loading
  if (initialLoading && !userProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If loading timed out but we still don't have the user, show an error
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Authentication Error</h2>
            </div>
            <p>You need to be logged in to view this page. Please <a href="/login" className="text-primary-600 hover:underline">sign in</a> to continue.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      {!userProfile && !initialLoading && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center text-yellow-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Some profile data couldn't be loaded. You can still update your information.</p>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-6 w-6 mr-2 text-primary-600" />
            Profile Information
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Profile updated successfully!
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                <User className="h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="+91 XXXXX XXXXX"
              />
              <p className="text-xs text-gray-500">Used for emergency alerts and contact</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="pincode" className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 mr-2" />
                Pincode / ZIP Code
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Enter your area pincode"
              />
              <p className="text-xs text-gray-500">Used to show alerts relevant to your location</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="userType" className="flex items-center text-sm font-medium text-gray-700">
                <Shield className="h-4 w-4 mr-2" />
                Account Type
              </label>
              <input
                type="text"
                id="userType"
                name="userType"
                value={formData.userType === 'user' ? 'Regular User' : 
                       formData.userType === 'admin' ? 'Administrator' : 
                       formData.userType === 'rescueTeam' ? 'Rescue Team Member' : 
                       formData.userType}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md cursor-not-allowed"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col md:flex-row md:justify-between gap-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile; 