import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { AlertCircle, ShieldAlert, Mail, Lock, User, MapPin, UserPlus, LogIn, Phone, Eye, EyeOff } from 'lucide-react';

const AuthForm = ({ signup = false }) => {
  const [isLogin, setIsLogin] = useState(!signup);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup: signupFunction } = useAuth();

  // Update isLogin if the signup prop changes
  useEffect(() => {
    setIsLogin(!signup);
  }, [signup]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    pincode: '',
    phone: '',
    userType: 'user'
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    pincode: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the specific field error
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // For registration form
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
      
      if (!formData.pincode) {
        newErrors.pincode = 'Pincode is required';
        isValid = false;
      } else if (!/^\d+$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must contain only numbers';
        isValid = false;
      }
      
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^[0-9+\s()-]{7,15}$/.test(formData.phone)) {
        newErrors.phone = 'Enter a valid phone number';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signupFunction(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.pincode,
          formData.phone, 
          formData.userType
        );
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setErrors({
      email: '',
      password: '',
      name: '',
      pincode: '',
      phone: ''
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto border-t-4 border-red-500 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center mb-2">
          {isLogin ? (
            <ShieldAlert className="h-6 w-6 text-primary-600 mr-2" />
          ) : (
            <UserPlus className="h-6 w-6 text-primary-600 mr-2" />
          )}
          <CardTitle className="text-xl">{isLogin ? 'Sign In to Alert System' : 'Create Emergency Account'}</CardTitle>
        </div>
        <CardDescription>
          {isLogin 
            ? 'Secure access to snow safety alerts and emergency tools' 
            : 'Register to receive critical alerts and access emergency features'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-1 text-gray-500" />
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  error={errors.name}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-gray-500" />
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  error={errors.phone}
                />
                <p className="text-xs text-gray-500 mt-1">For emergency alerts and notifications</p>
              </div>
              
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  Pincode
                </label>
                <Input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="123456"
                  error={errors.pincode}
                />
              </div>
              
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm rounded-md"
                >
                  <option value="user">Regular User</option>
                  <option value="rescueTeam">Rescue Team</option>
                </select>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
              <Mail className="h-4 w-4 mr-1 text-gray-500" />
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
              <Lock className="h-4 w-4 mr-1 text-gray-500" />
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className={`w-full ${isLogin ? 'bg-primary-600 hover:bg-primary-700' : 'bg-red-600 hover:bg-red-700'}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait...
                </span>
              ) : (
                <>
                  {isLogin ? (
                    <span className="flex items-center">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In to Alert System
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Create Emergency Account
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button 
          variant="link" 
          onClick={toggleAuthMode}
          className="text-sm"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm; 