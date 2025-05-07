import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Menu, X, AlertTriangle, User, BarChart2, LogOut } from 'lucide-react';
import logoImage from '../../assets/logo.png';

// Function to generate avatar initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Function to get link classes based on active state
  const getLinkClasses = (path) => {
    const baseClasses = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
    const activeClasses = "border-primary-500 text-primary-700";
    const inactiveClasses = "border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700";
    
    return `${baseClasses} ${isActiveRoute(path) ? activeClasses : inactiveClasses}`;
  };

  // Function to get mobile link classes based on active state
  const getMobileLinkClasses = (path) => {
    const baseClasses = "block pl-3 pr-4 py-2 border-l-4 text-base font-medium";
    const activeClasses = "border-primary-500 text-primary-700 bg-primary-50";
    const inactiveClasses = "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300";
    
    return `${baseClasses} ${isActiveRoute(path) ? activeClasses : inactiveClasses}`;
  };

  // Default profile values if userProfile is not yet loaded
  const safeUserProfile = userProfile || { 
    name: currentUser?.displayName || 'User',
    userType: 'user'
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = safeUserProfile?.userType === 'admin';
  const isRescueTeam = safeUserProfile?.userType === 'rescueTeam';

  // Determine user background color based on user type
  const getUserBgColor = () => {
    if (isAdmin) return 'bg-purple-500';
    if (isRescueTeam) return 'bg-blue-500';
    return 'bg-primary-500';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src={logoImage} 
                  alt="Snow Shield Logo" 
                  className="h-10 w-auto mr-2"
                />
                <span className="font-bold text-xl text-primary-800">Snow Shield</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {currentUser ? (
                <>
                  <Link
                    to="/"
                    className={getLinkClasses('/')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/alerts"
                    className={getLinkClasses('/alerts')}
                  >
                    Alerts
                  </Link>
                  <Link
                    to="/education"
                    className={getLinkClasses('/education')}
                  >
                    Education
                  </Link>
                  {(isAdmin || isRescueTeam) && (
                    <Link
                      to="/admin"
                      className={getLinkClasses('/admin')}
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/education"
                  className={getLinkClasses('/education')}
                >
                  Education
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {/* SOS Emergency Button - Only visible to admin and rescue team */}
                {(safeUserProfile.userType === 'admin' || safeUserProfile.userType === 'rescueTeam') && (
                  <Link to="/sos">
                    <Button variant="destructive" size="sm" className="font-medium">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      SOS
                    </Button>
                  </Link>
                )}
                
                {/* User Profile Menu */}
                <div className="ml-3 relative">
                  <Link 
                    to="/profile"
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-white ${getUserBgColor()}`}
                  >
                    {getInitials(safeUserProfile.name)}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login?signup=true">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {currentUser ? (
              <>
                <Link
                  to="/"
                  className={getMobileLinkClasses('/')}
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/alerts"
                  className={getMobileLinkClasses('/alerts')}
                  onClick={toggleMenu}
                >
                  Alerts
                </Link>
                <Link
                  to="/education"
                  className={getMobileLinkClasses('/education')}
                  onClick={toggleMenu}
                >
                  Education
                </Link>
                {(safeUserProfile.userType === 'admin' || safeUserProfile.userType === 'rescueTeam') && (
                  <Link
                    to="/sos"
                    className="block pl-3 pr-4 py-2 border-l-4 border-red-500 text-base font-medium text-red-700 bg-red-50"
                    onClick={toggleMenu}
                  >
                    SOS Emergency
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={getMobileLinkClasses('/profile')}
                  onClick={toggleMenu}
                >
                  My Profile
                </Link>
                {(isAdmin || isRescueTeam) && (
                  <Link
                    to="/admin"
                    className={getMobileLinkClasses('/admin')}
                    onClick={toggleMenu}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/education"
                className={getMobileLinkClasses('/education')}
                onClick={toggleMenu}
              >
                Education
              </Link>
            )}
          </div>
          
          {currentUser ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${getUserBgColor()}`}>
                  {getInitials(safeUserProfile.name)}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{safeUserProfile.name}</div>
                  <div className="text-sm font-medium text-gray-500">{currentUser.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="mt-3 space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/login?signup=true"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 