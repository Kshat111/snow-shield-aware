import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import { AlertTriangle, Bell, Shield, Clock, BookOpen } from 'lucide-react';
import logoImage from '../assets/logo.png';
import backgroundImage from '../assets/background.jpg';

// Style for the background overlay
const overlayStyle = {
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={overlayStyle}>
      <div className="max-w-5xl w-full bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={logoImage} 
              alt="Snow Shield Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome to Snow Shield
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Your emergency companion for avalanche safety
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign in to your account</h3>
              <AuthForm signup={location.search.includes('signup=true')} />
            </div>
          </div>
          
          <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">The complete safety toolkit</h3>
            
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Real-time Alerts</h4>
                  <p className="mt-1 text-gray-500">
                    Receive instant notifications about avalanches and snow hazards in your area.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">SOS Emergency</h4>
                  <p className="mt-1 text-gray-500">
                    One-click emergency alert to notify rescue services of your location.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Incident Reporting</h4>
                  <p className="mt-1 text-gray-500">
                    Report snow hazards to help others stay safe on the mountain.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Educational Resources</h4>
                  <p className="mt-1 text-gray-500">
                    Browse our educational content to learn essential safety information.
                  </p>
                  <Link 
                    to="/education" 
                    className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center mt-2 py-2 px-4 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    Access without an account
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14 5l7 7m0 0l-7 7m7-7H3" 
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 